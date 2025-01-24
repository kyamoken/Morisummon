from django.conf import settings
from django.db import models
from django.forms import ValidationError
from django.contrib.auth.models import AbstractUser
from mongoengine import Document, fields

class PlayerStats(Document):
    user = fields.ReferenceField(settings.AUTH_USER_MODEL)
    hp = fields.IntField(default=100)
    attack = fields.IntField(default=10)

    def __str__(self):
        return self.user.username


class Battle(Document):
    history = fields.ListField(fields.StringField())
    player1 = fields.ReferenceField(PlayerStats)
    player2 = fields.ReferenceField(PlayerStats)
    turn = fields.IntField(default=1)

    def __str__(self):
        return self.name


class CustomUser(AbstractUser):
    magic_stones = models.IntegerField(default=0)

    def __str__(self):
        return self.username


class Card(models.Model):
    name = models.CharField(max_length=255)  # 名前
    hp = models.IntegerField(default=0)  # 体力
    attack = models.IntegerField(default=0)  # 攻撃力
    image = models.ImageField(upload_to='images/')  # 画像

    def __str__(self):
        return self.name


class UserCard(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    card = models.ForeignKey(Card, on_delete=models.CASCADE)
    amount = models.IntegerField(default=0)  # 所持数

    class Meta:
        unique_together = ('user', 'card')


class Deck(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    card_ids = models.JSONField(default=list)  # JSONField to store the list of cards

    def clean(self):
        card_ids = [None for _ in range(settings.MORISUMMON_DECK_SIZE)]

        for i, card_id in enumerate(self.card_ids):
            if not isinstance(card_id, int):
                continue

            try:
                card = Card.objects.get(pk=card_id)
                card_ids[i] = card
            except Card.DoesNotExist:
                raise ValidationError('存在しないカードが含まれています')

        self.card_ids = card_ids

    def __str__(self):
        return f"{self.user.username}'s Deck"
