import json
from django.conf import settings
from django.db.models import Q
from django.shortcuts import render
from django.contrib.auth import get_user_model, authenticate, login as auth_login, logout
from django.middleware.csrf import get_token
from django.views.decorators.csrf import ensure_csrf_cookie
from rest_framework.authtoken.models import Token
from morisummon.serializers import UserSerializer
from .models import Card, UserCard, Deck, ChatMessage, ChatGroup, FriendRequest, Notification, CardExchange
from .serializers import CardSerializer, DeckSerializer
import random
from django.core.exceptions import ObjectDoesNotExist, ValidationError
from .serializers import ChatMessageSerializer, ChatGroupSerializer
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import CardExchange, ExchangeSession
from django.db import transaction

# Custom User modelを取得
User = get_user_model()

def index(request):
    template_name = 'dev.html' if settings.VITE_DEV else 'index.html'
    return render(request, template_name)

@api_view(['POST'])
def login(request):
    username = request.data.get('username')
    password = request.data.get('password')

    user = authenticate(username=username, password=password)
    if user is not None:
        auth_login(request, user)

        user = UserSerializer(user)

        return Response({
            'user': user.data
        }, status=200)
    else:
        return Response({'error': 'Invalid credentials'}, status=400)

@api_view(['POST'])
def logout_view(request):
    if request.user.is_authenticated:
        logout(request)

    return Response(status=204)

@api_view(['GET'])
def me(request):
    user = request.user
    if user.is_authenticated:
        serializer = UserSerializer(user)
        return Response({'user': serializer.data}, status=200)
    else:
        return Response({'user': None}, status=200)

@ensure_csrf_cookie
@api_view(['GET'])
def csrf_token(request):
    token = get_token(request)
    return Response(status=204)

@api_view(['POST'])
def register(request):
    username = request.data.get('username')
    password = request.data.get('password')

    if not username or not password:
        return Response({'error': 'Username and password are required'}, status=400)

    if User.objects.filter(username=username).exists():
        return Response({'error': 'Username already exists'}, status=400)

    user = User.objects.create_user(username=username, password=password)
    token = Token.objects.create(user=user)

    return Response({'token': str(token)}, status=201)

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


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_exchange(request):
    receiver_id = request.data.get('receiver_id')
    User = get_user_model()  # settings.AUTH_USER_MODEL をモデルクラスに変換
    receiver = get_object_or_404(User, id=receiver_id)

    with transaction.atomic():
        exchange = CardExchange.objects.create(
            initiator=request.user,
            receiver=receiver,
            status='waiting'
        )
        ExchangeSession.objects.create(exchange=exchange)

    return Response({
        'exchange_id': exchange.id,
        'message': 'Exchange created successfully'
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def cancel_exchange(request, exchange_id):
    exchange = get_object_or_404(CardExchange, id=exchange_id)

    if request.user not in [exchange.initiator, exchange.receiver]:
        return Response({'error': 'Permission denied'}, status=403)

    exchange.status = 'canceled'
    exchange.save()

    return Response({'message': 'Exchange canceled'})

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_exchange_details(request, exchange_id):
    exchange = get_object_or_404(CardExchange, id=exchange_id)
    return Response({
        'id': exchange.id,
        'initiator': exchange.initiator.username,
        'receiver': exchange.receiver.username,
        'status': exchange.status,
        'initiator_card': exchange.initiator_card.id if exchange.initiator_card else None,
        'receiver_card': exchange.receiver_card.id if exchange.receiver_card else None,
        'participants': [exchange.initiator.username, exchange.receiver.username],
    })

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def select_card(request, exchange_id):
    exchange = get_object_or_404(CardExchange, id=exchange_id)
    card_id = request.data.get('card_id')

    try:
        card = Card.objects.get(id=card_id)
    except Card.DoesNotExist:
        return Response({'error': 'カードが見つかりません'}, status=404)

    if request.user == exchange.initiator:
        exchange.initiator_card = card
    elif request.user == exchange.receiver:
        exchange.receiver_card = card

    exchange.status = 'selecting'
    exchange.save()

    return Response({'message': 'カードを選択しました'})

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def confirm_exchange(request, exchange_id):
    exchange = get_object_or_404(CardExchange, id=exchange_id)

    if not exchange.initiator_card or not exchange.receiver_card:
        return Response({'error': '両者がカードを選択していません'}, status=400)

    exchange.status = 'completed'
    exchange.save()

    return Response({'message': '交換が確定しました'})

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_card_details(request, card_id):
    card = get_object_or_404(Card, id=card_id)
    return Response({
        'id': card.id,
        'name': card.name,
        'image': card.image.url,
        'hp': card.hp,
        'attack': card.attack,
    })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def check_active_exchange(request, user_id):
    # 両ユーザー間のアクティブな交換セッションを検索
    active_exchange = CardExchange.objects.filter(
        Q(initiator=request.user, receiver_id=user_id) |
        Q(initiator_id=user_id, receiver=request.user),
        status__in=['waiting', 'selecting']
    ).first()

    if active_exchange:
        return Response({
            'exists': True,
            'exchange_id': active_exchange.id
        })
    return Response({'exists': False})
