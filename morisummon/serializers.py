from rest_framework import serializers
from django.contrib.auth.models import User
from morisummon.models import Card


# from django.conf import settings

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        exclude = ['password']

class CardSerializer(serializers.ModelSerializer):
    class Meta:
        model = Card
        fields = ['id', 'name', 'hp', 'attack', 'image']
