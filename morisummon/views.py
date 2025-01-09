from django.conf import settings
from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth import authenticate
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .models import CustomUser
from .serializers import CustomUserSerializer
import json

def index(request):
    template_name = 'dev.html' if settings.VITE_DEV else 'index.html'
    return render(request, template_name)

@csrf_exempt
def obtain_token(request):
    if request.method == 'POST':
        body = json.loads(request.body)
        username = body.get('username')
        password = body.get('password')
        user = authenticate(username=username, password=password)
        if user is not None:
            # トークン生成処理をここに追加
            return JsonResponse({'token': 'dummy-token'}, status=200)
        else:
            return JsonResponse({'error': 'Invalid credentials'}, status=400)
    return JsonResponse({'error': 'Invalid method'}, status=405)

@api_view(['GET', 'POST'])
def custom_user_list(request):
    if request.method == 'GET':
        users = CustomUser.objects.all()
        serializer = CustomUserSerializer(users, many=True)
        return Response(serializer.data)
    elif request.method == 'POST':
        serializer = CustomUserSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'PUT', 'DELETE'])
def custom_user_detail(request, pk):
    try:
        user = CustomUser.objects.get(pk=pk)
    except CustomUser.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        serializer = CustomUserSerializer(user)
        return Response(serializer.data)
    elif request.method == 'PUT':
        serializer = CustomUserSerializer(user, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    elif request.method == 'DELETE':
        user.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
