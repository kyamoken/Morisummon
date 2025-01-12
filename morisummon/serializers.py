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
    cards = CardSerializer(many=True)

    class Meta:
        model = Deck
        fields = ['user', 'cards']
        extra_kwargs = {'user': {'read_only': True}}

    def create(self, validated_data):
        cards_data = validated_data.pop('cards')
        request = self.context.get('request')
        user = request.user if request else None
        deck = Deck.objects.create(user=user, **validated_data)
        for card_data in cards_data:
            card, created = Card.objects.get_or_create(**card_data)
            deck.cards.add(card)
        return deck
