import json
from django.conf import settings
from django.shortcuts import render
from django.contrib.auth import get_user_model, authenticate, login as auth_login, logout
from django.middleware.csrf import get_token
from django.views.decorators.csrf import ensure_csrf_cookie
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from morisummon.serializers import UserSerializer
from .models import Card, UserCard, Deck, ChatMessage, ChatGroup, FriendRequest
from .serializers import CardSerializer, DeckSerializer
import random
from django.core.exceptions import ObjectDoesNotExist, ValidationError
from .serializers import ChatMessageSerializer, ChatGroupSerializer

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
