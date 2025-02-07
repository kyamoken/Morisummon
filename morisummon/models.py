from datetime import datetime
from django.conf import settings
from django.db import models
from django.forms import ValidationError
from django.contrib.auth.models import AbstractUser
from mongoengine import Document, fields
import ulid

def generate_ulid():
    return str(ulid.ULID())

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


######　以下はチャット関連の実装 ######
class ChatGroup(models.Model):
    name = models.CharField(max_length=255, unique=True)
    members = models.ManyToManyField(settings.AUTH_USER_MODEL)
    created_at = models.DateTimeField(default=datetime.utcnow)

    def __str__(self):
        return self.name

class ChatMessage(models.Model):
    group = models.ForeignKey(ChatGroup, on_delete=models.CASCADE)
    sender = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    message = models.TextField()
    timestamp = models.DateTimeField(default=datetime.utcnow)

    def __str__(self):
        return f'{self.sender.username} - {self.timestamp}'
###### ここまで ######

class FriendRequest(models.Model):
    from_user = models.ForeignKey(settings.AUTH_USER_MODEL, related_name='friend_requests_sent', on_delete=models.CASCADE)
    to_user = models.ForeignKey(settings.AUTH_USER_MODEL, related_name='friend_requests_received', on_delete=models.CASCADE)
    status = models.CharField(
        max_length=10,
        choices=[('pending', 'Pending'), ('accepted', 'Accepted'), ('rejected', 'Rejected')],
        default='pending'
    )
    created_at = models.DateTimeField(default=datetime.utcnow)

    class Meta:
        unique_together = ('from_user', 'to_user')

    def __str__(self):
        return f'{self.from_user.username} -> {self.to_user.username} ({self.status})'

class Friendship(models.Model):
    user1 = models.ForeignKey(settings.AUTH_USER_MODEL, related_name='friendships1', on_delete=models.CASCADE)
    user2 = models.ForeignKey(settings.AUTH_USER_MODEL, related_name='friendships2', on_delete=models.CASCADE)
    created_at = models.DateTimeField(default=datetime.utcnow)

    class Meta:
        unique_together = ('user1', 'user2')

    def __str__(self):
        return f'{self.user1.username} <-> {self.user2.username}'

class Notification(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, related_name='notifications', on_delete=models.CASCADE)
    message = models.CharField(max_length=255)
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(default=datetime.utcnow)

    def __str__(self):
        return f'{self.user.username} - {self.message}'

class ExchangeSession(models.Model):
    ulid = models.CharField(
        max_length=26,
        unique=True,
        default=generate_ulid
    )
    STATUS_CHOICES = (
        ('pending', 'Pending'),     # 交換作成済み（未提案）
        ('proposed', 'Proposed'),    # カード提案済み
        ('completed', 'Completed'),  # 交換完了
        ('cancelled', 'Cancelled'), # キャンセル済み
    )
    proposer = models.ForeignKey(settings.AUTH_USER_MODEL, related_name='proposed_exchanges', on_delete=models.CASCADE)
    receiver = models.ForeignKey(settings.AUTH_USER_MODEL, related_name='received_exchanges', on_delete=models.CASCADE)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)

    # ここで交換提案されたカード情報を保存するフィールドを追加（null=True としておく）
    proposed_card_id = models.IntegerField(null=True, blank=True)

    def __str__(self):
        return f'{self.proposer.username} -> {self.receiver.username} ({self.status})'

