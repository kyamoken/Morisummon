from django.conf import settings
from rest_framework import serializers
from morisummon.models import Card, Deck, ChatMessage, ChatGroup, UserCard, ExchangeSession, Sound
from accounts.serializers import UserSerializer

class CardSerializer(serializers.ModelSerializer):
    class Meta:
        model = Card
        fields = [
            'id', 'name', 'hp', 'attack', 'image',
            'retreat_cost', 'attack_cost', 'type', 'category',
            'attack_name', 'pack', 'ability'
        ]


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

class UserCardSerializer(serializers.ModelSerializer):
    card = CardSerializer(read_only=True)  # カード情報をネストして返す

    class Meta:
        model = UserCard
        fields = ['card', 'amount']


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

########## 以下はチャット関連の実装 ##########
class ChatMessageSerializer(serializers.ModelSerializer):
        sender = UserSerializer(read_only=True)

        class Meta:
            model = ChatMessage
            fields = ['id', 'sender', 'message', 'timestamp']

class ChatGroupSerializer(serializers.ModelSerializer):
    members = UserSerializer(many=True, read_only=True)

    class Meta:
        model = ChatGroup
        fields = ['id', 'name', 'members', 'created_at']

    def create(self, validated_data):
        chat_group = ChatGroup.objects.create(**validated_data)
        request = self.context.get('request')
        if request and hasattr(request, 'user'):
            chat_group.members.add(request.user)
        return chat_group

class ExchangeSessionSerializer(serializers.ModelSerializer):
    class Meta:
        model = ExchangeSession
        fields = ['ulid', 'status', 'proposer_id', 'receiver_id', 'proposed_card_id']

class SoundSerializer(serializers.ModelSerializer):
    file_url = serializers.SerializerMethodField()

    class Meta:
        model = Sound
        fields = ['id', 'name', 'is_bgm', 'file_url']

    def get_file_url(self, obj):
        request = self.context.get('request')
        return request.build_absolute_uri(obj.file.url)


########## 以上はチャット関連の実装 ##########

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
