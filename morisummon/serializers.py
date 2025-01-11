from rest_framework import serializers
from django.contrib.auth.models import User
from morisummon.models import Card, Deck

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        exclude = ['password']

class CardSerializer(serializers.ModelSerializer):
    class Meta:
        model = Card
        fields = ['id', 'name', 'hp', 'attack', 'image']

class DeckSerializer(serializers.ModelSerializer):
    class Meta:
        model = Deck
        fields = ['user', 'cards']
        extra_kwargs = {'user': {'read_only': True}}

    def create(self, validated_data):
        request = self.context.get('request')
        user = request.user if request else None
        return Deck.objects.create(user=user, **validated_data)
