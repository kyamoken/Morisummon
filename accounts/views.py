from django.shortcuts import render
from django.contrib.auth import get_user_model, authenticate, login as auth_login, logout
from django.middleware.csrf import get_token
from django.views.decorators.csrf import ensure_csrf_cookie
from rest_framework.decorators import api_view
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from rest_framework.decorators import permission_classes
from .serializers import UserSerializer
from .permissions import IsAnonymousUser


User = get_user_model()

# Create your views here.
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
@permission_classes([IsAnonymousUser])
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

from datetime import timedelta
from django.utils import timezone

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def login_bonus(request):
    user = request.user
    today = timezone.localdate()
    yesterday = today - timedelta(days=1)

    # すでに本日のボーナスを受け取っている場合は何もしない
    if user.login_bonus_last_date == today:
        return Response({'awarded': False})

    # 連続ログインかどうかを判定
    if user.login_bonus_last_date == yesterday:
        user.login_bonus_streak += 1
    else:
        user.login_bonus_streak = 1

    # ボーナスの計算：
    # 連続7日目までは「連続日数 x 10個」、8日目以降は毎日100個
    if user.login_bonus_streak <= 7:
        bonus = user.login_bonus_streak * 10
    else:
        bonus = 100

    user.magic_stones += bonus
    user.login_bonus_last_date = today
    user.save()

    return Response({
        'awarded': True,
        'bonus': bonus,
        'streak': user.login_bonus_streak,
    })

