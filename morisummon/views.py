import json
from django.conf import settings
from django.db.models import Q
from django.shortcuts import render
from django.contrib.auth import get_user_model, authenticate, login as auth_login, logout
from django.middleware.csrf import get_token
from django.views.decorators.csrf import ensure_csrf_cookie
from rest_framework.authtoken.models import Token
from morisummon.serializers import UserSerializer
from .models import Card, UserCard, Deck, ChatMessage, ChatGroup, FriendRequest, Notification, ExchangeSession
from .serializers import CardSerializer, DeckSerializer
import random
from django.core.exceptions import ObjectDoesNotExist, ValidationError
from .serializers import ChatMessageSerializer, ChatGroupSerializer
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response


# Custom User modelを取得
User = get_user_model()

def index(request):
    template_name = 'dev.html' if settings.VITE_DEV else 'index.html'
    return render(request, template_name)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def gacha(request):
    user = request.user
    required_stones = 10  # 1回のガチャで必要なガチャ石の数

    if user.magic_stones < required_stones:
        return Response({'error': 'ガチャ石が足りません'}, status=400)

    try:
        user.magic_stones -= required_stones
        user.save()

        cards = Card.objects.all()
        if not cards.exists():
            return Response({'error': 'No cards available'}, status=404)

        drawn_cards = random.choices(list(cards), k=5)  # 5枚のカードをランダムに引く
        for card in drawn_cards:
            user_card, created = UserCard.objects.get_or_create(user=user, card=card)
            user_card.amount += 1
            user_card.save()

        serializer = CardSerializer(drawn_cards, many=True)
        return Response({'cards': serializer.data})
    except ObjectDoesNotExist:
        return Response({'error': 'Cards not found'}, status=404)
    except ValueError as e:
        return Response({'error': str(e)}, status=400)
    except Exception as e:
        return Response({'error': 'Internal Server Error'}, status=500)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_cards(request):
    user = request.user

    user_cards = UserCard.objects.filter(user=user)
    data = [{'card': CardSerializer(uc.card).data, 'amount': uc.amount} for uc in user_cards]
    return Response(data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def save_deck(request):
    user = request.user

    deck_card_ids = request.data
    if len(deck_card_ids) != 5:
        return Response({'error': 'デッキは5枚で構成されている必要があります'}, status=400)

    if len(deck_card_ids) != len(set(deck_card_ids)):
        return Response({'error': 'duplicate_card', 'message': '同一カードを複数枚デッキに追加することはできません'}, status=400)

    filtered_cards = []
    for card_id in deck_card_ids:
        if not isinstance(card_id, int):
            filtered_cards.append(None)
            continue

        try:
            card = Card.objects.get(pk=card_id)
            UserCard.objects.get(user=user, card=card)

            filtered_cards.append(card.pk)
        except Card.DoesNotExist:
            return Response({'error': '存在しないカードが含まれています'}, status=400)
        except UserCard.DoesNotExist:
            return Response({'error': '所有していないカードが含まれています'}, status=400)

    try:
        deck = Deck.objects.filter(user=user).first()
        if not deck:
            deck = Deck(user=user)

        deck.card_ids = filtered_cards
        deck.save()

        return Response({"message": "デッキが正常に保存されました"})
    except Exception as e:
        return Response({'error': str(e)}, status=500)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_deck(request):
    user = request.user

    deck = Deck.objects.filter(user=user).first()
    serialized = DeckSerializer(deck)

    try:
        deck_cards = serialized.data['cards']
    except KeyError:
        deck_cards = [None for _ in range(settings.MORISUMMON_DECK_SIZE)]

    return Response({
        'deck_cards': deck_cards
    })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_chat_messages(request, group_name):
    if not ChatGroup.objects.filter(name=group_name, members=request.user).exists():
        return Response({'error': 'Unauthorized'}, status=401)

    messages = ChatMessage.objects.filter(group__name=group_name).order_by('timestamp')
    serializer = ChatMessageSerializer(messages, many=True)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_chat_groups(request):
    groups = ChatGroup.objects.filter(members=request.user)
    serializer = ChatGroupSerializer(groups, many=True)
    return Response(serializer.data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_chat_group(request):
    try:
        serializer = ChatGroupSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)
    except Exception as e:
        return Response({'error': str(e)}, status=500)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_user_to_group(request, group_name):
    try:
        group = ChatGroup.objects.get(name=group_name)
        username = request.data.get('username')
        user = get_user_model().objects.get(username=username)

        if user not in group.members.all():
            group.members.add(user)
            return Response({'message': 'ユーザーがグループに追加されました'}, status=200)
        else:
            return Response({'error': 'ユーザーは既にグループに存在します'}, status=400)
    except ChatGroup.DoesNotExist:
        return Response({'error': 'グループが見つかりません'}, status=404)
    except get_user_model().DoesNotExist:
        return Response({'error': 'ユーザーが見つかりません'}, status=404)
    except Exception as e:
        return Response({'error': str(e)}, status=500)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_friends(request):
    friends = request.user.get_friends()
    friend_list = [{'id': friend.id, 'username': friend.username} for friend in friends]
    return Response({'friends': friend_list})

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def send_friend_request(request):
    username = request.data.get('username')
    if not username:
        return Response({'error': 'username is required.'}, status=400)

    try:
        to_user = User.objects.get(username=username)
        if FriendRequest.objects.filter(from_user=request.user, to_user=to_user).exists():
            return Response({'error': '既にフレンドリクエストを送信しています。'}, status=400)
        request.user.send_friend_request(to_user)
        return Response({'message': 'Friend request sent.'})
    except User.DoesNotExist:
        return Response({'error': 'User not found.'}, status=404)
    except ValidationError as e:
        return Response({'error': str(e)}, status=400)
    except Exception as e:
        return Response({'error': 'Internal Server Error'}, status=500)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_friend_requests(request):
    requests = request.user.get_pending_requests()
    request_list = [{'id': req.id, 'from_user': req.from_user.username} for req in requests]
    return Response({'requests': request_list})

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def handle_friend_request(request, request_id):
    action = request.data.get('action')
    try:
        friend_request = FriendRequest.objects.get(id=request_id)
        if action == 'accept':
            request.user.accept_friend_request(request_id)
        elif action == 'reject':
            request.user.reject_friend_request(request_id)
        else:
            return Response({'error': 'Invalid action.'}, status=400)
        return Response({'message': f'Friend request {action}ed.'})
    except FriendRequest.DoesNotExist:
        return Response({'error': 'Friend request not found.'}, status=404)

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def remove_friend(request, friend_id):
    try:
        friend = User.objects.get(id=friend_id)
        request.user.remove_friend(friend)
        return Response({'message': 'Friend removed.'})
    except User.DoesNotExist:
        return Response({'error': 'Friend not found.'}, status=404)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_notifications(request):
    notifications = Notification.objects.filter(user=request.user).order_by('-created_at')
    notification_list = [
        {
            'id': notification.id,
            'message': notification.message,
            'is_read': notification.is_read,
            'created_at': notification.created_at,
        }
        for notification in notifications
    ]
    return Response({'notifications': notification_list})

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def mark_notification_as_read(request, notification_id):
    try:
        notification = Notification.objects.get(id=notification_id, user=request.user)
        notification.is_read = True
        notification.save()
        return Response({'message': 'Notification marked as read.'})
    except Notification.DoesNotExist:
        return Response({'error': 'Notification not found.'}, status=404)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_unread_notification_count(request):
    unread_count = Notification.objects.filter(user=request.user, is_read=False).count()
    return Response({'unread_count': unread_count})


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def check_exchange(request, friend_id):
    from django.contrib.auth import get_user_model
    User = get_user_model()
    try:
        friend = User.objects.get(id=friend_id)
    except User.DoesNotExist:
        return Response({'error': 'Friend not found'}, status=404)

    try:
        exchange = ExchangeSession.objects.get(
            Q(proposer=request.user, receiver=friend) | Q(proposer=friend, receiver=request.user),
            status='pending'
        )
        return Response({
            'exists': True,
            'exchange_ulid': exchange.ulid,  # ULID を返す
            'proposer_id': exchange.proposer.id
        })
    except ExchangeSession.DoesNotExist:
        return Response({'exists': False})


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_exchange(request):
    receiver_id = request.data.get('receiver_id')
    if not receiver_id:
        return Response({'error': 'receiver_id is required'}, status=400)

    from django.contrib.auth import get_user_model
    User = get_user_model()
    try:
        receiver = User.objects.get(id=receiver_id)
    except User.DoesNotExist:
        return Response({'error': 'Receiver not found'}, status=404)

    # 既に pending の交換セッションが存在していないかチェック（オプション）
    qs = ExchangeSession.objects.filter(
        Q(proposer=request.user, receiver=receiver) | Q(proposer=receiver, receiver=request.user),
        status='pending'
    )
    if qs.exists():
        exchange = qs.first()
        return Response({'exchange_ulid': exchange.ulid})

    exchange = ExchangeSession.objects.create(
        proposer=request.user,
        receiver=receiver,
        status='pending'
        # ※ ulid はモデルの default で自動生成する想定
    )
    return Response({'exchange_ulid': exchange.ulid})


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def cancel_exchange(request, exchange_ulid):
    try:
        exchange = ExchangeSession.objects.get(ulid=exchange_ulid, status='pending')
    except ExchangeSession.DoesNotExist:
        return Response({'error': 'Exchange session not found or cannot be cancelled'}, status=404)

    # キャンセルは提案者のみ可能
    if exchange.proposer != request.user:
        return Response({'error': 'Only the proposer can cancel the exchange'}, status=403)

    exchange.status = 'cancelled'
    exchange.save()
    return Response({'message': 'Exchange cancelled successfully'})


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def propose_exchange(request, exchange_ulid):
    """
    ユーザーがカードを選択して交換提案を完了するエンドポイント
    リクエスト例：
        { "card_id": 123 }
    """
    card_id = request.data.get('card_id')
    if not card_id:
        return Response({'error': 'card_id is required'}, status=400)

    try:
        exchange = ExchangeSession.objects.get(ulid=exchange_ulid, status='pending')
    except ExchangeSession.DoesNotExist:
        return Response({'error': 'Exchange session not found'}, status=404)

    if exchange.proposer != request.user:
        return Response({'error': 'Only the proposer can propose an exchange'}, status=403)

    # 選択したカードのIDを保存する
    exchange.proposed_card_id = card_id
    exchange.save()

    # 状態を「completed」に変更するなど、必要な処理を追加
    # ※ ロジックに合わせて適宜変更してください
    exchange.status = 'completed'
    exchange.save()

    return Response({'message': 'Exchange proposed successfully'})


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_exchange(request, exchange_ulid):
    try:
        exchange = ExchangeSession.objects.get(ulid=exchange_ulid)
    except ExchangeSession.DoesNotExist:
        return Response({'error': 'Exchange session not found'}, status=404)

    return Response({
        'ulid': exchange.ulid,
        'status': exchange.status,
        'proposer_id': exchange.proposer.id,
        'receiver_id': exchange.receiver.id,
        'proposed_card_id': exchange.proposed_card_id,  # 追加したフィールド
    })
