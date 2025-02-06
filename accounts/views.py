from django.shortcuts import render
from django.contrib.auth import get_user_model, authenticate, login as auth_login, logout
from django.middleware.csrf import get_token
from django.views.decorators.csrf import ensure_csrf_cookie
from rest_framework.decorators import api_view
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
