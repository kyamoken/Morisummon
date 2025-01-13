from django.conf import settings
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


class CardListField(serializers.Field):
    # Internal -> External
    def to_representation(self, value):
        deck_cards = [None for _ in range(settings.MORISUMMON_DECK_SIZE)]

        for i, card in enumerate(value):
            deck_cards[i] = card

        return deck_cards

    # External -> Internal
    def to_internal_value(self, data):
        card_ids = [None for _ in range(settings.MORISUMMON_DECK_SIZE)]

        for i, card in enumerate(data):
            if isinstance(card, int):
                card_ids[i] = card

            if isinstance(card, Card):
                card_ids[i] = card.pk

        return card_ids


class DeckSerializer(serializers.ModelSerializer):
    card_ids = CardListField()
    cards = serializers.SerializerMethodField()

    class Meta:
        model = Deck
        fields = ['id', 'user', 'card_ids', 'cards']

    def get_cards(self, obj):
        ids = obj.card_ids

        cards = [None for _ in range(settings.MORISUMMON_DECK_SIZE)]
        for i, card in enumerate(ids):
            if card is not None:
                try:
                    card = Card.objects.get(pk=card)
                    cards[i] = CardSerializer(card).data
                except Card.DoesNotExist:
                    pass

        return cards


    # def create(self, validated_data):
    #     card_ids = validated_data.pop('card_ids')
    #     deck = Deck.objects.create(**validated_data)
    #     deck.card_ids.set(card_ids)
    #     return deck

    # def update(self, instance, validated_data):
    #     card_ids = validated_data.pop('card_ids')
    #     instance.card_ids.set(card_ids)
    #     return instance

    # def to_representation(self, instance):
    #     ret = super().to_representation(instance)
    #     ret['card_ids'] = [CardSerializer(card).data for card in instance.card_ids.all()]
    #     return ret

    # def to_internal_value(self, data):
    #     data['card_ids'] = [card['id'] for card in data['card_ids']]
    #     return super().to_internal_value(data)

    # class Meta:
    #     model = Deck
    #     fields = ['id', 'user', 'card_ids']
    #     depth = 1

    # def to_representation(self, instance):
    #     ret = super().to_representation(instance)
    #     ret['card_ids'] = [CardSerializer(card).data for card in instance.card_ids]
    #     return ret

    # def to_internal_value(self, data):
    #     data['card_ids'] = [card['id'] for card in data['card_ids']]
    #     return super().to_internal_value(data)
