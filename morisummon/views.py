from django.conf import settings
from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth import authenticate, logout
from django.middleware.csrf import get_token
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from rest_framework import authentication
from morisummon.serializers import UserSerializer

def index(request):
    template_name = 'dev.html' if settings.VITE_DEV else 'index.html'
    return render(request, template_name)

@api_view(['POST'])
def login(request):
    username = request.data.get('username')
    password = request.data.get('password')

    user = authenticate(username=username, password=password)
    if user is not None:
        token = Token.objects.get_or_create(user=user)
        user = UserSerializer(user)

        return JsonResponse({
            'token': str(token[0]),
            'user': user.data
        }, status=200)
    else:
        return JsonResponse({'error': 'Invalid credentials'}, status=400)

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
        return JsonResponse({'user': serializer.data}, status=200)
    else:
        return JsonResponse({'user': None}, status=200)

@csrf_exempt
@api_view(['GET'])
def csrf_token(request):
    token = get_token(request)
    return JsonResponse({'csrfToken': token}, status=200)
