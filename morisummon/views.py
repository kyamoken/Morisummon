from django.conf import settings
from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth import authenticate, logout
from django.middleware.csrf import get_token
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from morisummon.serializers import UserSerializer
from django.contrib.auth.models import User
from .models import Card, UserCard
from .serializers import CardSerializer
import random
from django.core.exceptions import ObjectDoesNotExist

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

@api_view(['POST'])
def register(request):
    username = request.data.get('username')
    password = request.data.get('password')

    if not username or not password:
        return JsonResponse({'error': 'Username and password are required'}, status=400)

    if User.objects.filter(username=username).exists():
        return JsonResponse({'error': 'Username already exists'}, status=400)

    user = User.objects.create_user(username=username, password=password)
    token = Token.objects.create(user=user)

    return JsonResponse({'token': str(token)}, status=201)

@api_view(['GET'])
def gacha(request):
    user = request.user
    if not user.is_authenticated:
        return JsonResponse({'error': 'User not authenticated'}, status=401)

    try:
        cards = Card.objects.all()
        if not cards.exists():
            return JsonResponse({'error': 'No cards available'}, status=404)

        drawn_cards = random.sample(list(cards), k=5)  # 5枚のカードをランダムに引く
        for card in drawn_cards:
            user_card, created = UserCard.objects.get_or_create(user=user, card=card)
            user_card.amount += 1
            user_card.save()

        serializer = CardSerializer(drawn_cards, many=True)
        return Response({'cards': serializer.data})
    except ObjectDoesNotExist:
        return JsonResponse({'error': 'Cards not found'}, status=404)
    except ValueError as e:
        return JsonResponse({'error': str(e)}, status=400)
    except Exception as e:
        return JsonResponse({'error': 'Internal Server Error'}, status=500)

@api_view(['GET'])
def user_cards(request):
    user_cards = UserCard.objects.filter(user=request.user)
    data = [{'name': uc.card.name, 'amount': uc.amount} for uc in user_cards]
    return JsonResponse(data, safe=False)
