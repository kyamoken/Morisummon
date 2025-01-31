from datetime import datetime
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

    def get_friends(self):
        # ユーザーのフレンド一覧を取得
        friendships1 = Friendship.objects.filter(user1=self).values_list('user2', flat=True)
        friendships2 = Friendship.objects.filter(user2=self).values_list('user1', flat=True)
        friends_ids = set(friendships1).union(set(friendships2))
        friends = CustomUser.objects.filter(id__in=friends_ids)
        return friends

    def get_pending_requests(self):
        # ユーザーに送信された未承認のフレンドリクエストを取得
        return FriendRequest.objects.filter(to_user=self, status='pending')

    def send_friend_request(self, to_user):
        if self == to_user:
            raise ValidationError("自分自身にフレンドリクエストを送信することはできません。")
        if Friendship.objects.filter(user1=self, user2=to_user).exists():
            raise ValidationError("既にフレンドです。")
        if FriendRequest.objects.filter(from_user=self, to_user=to_user, status='pending').exists():
            raise ValidationError("既にフレンドリクエストを送信しています。")
        FriendRequest.objects.create(from_user=self, to_user=to_user)

    def accept_friend_request(self, request_id):
        # フレンドリクエストを承認
        request = FriendRequest.objects.get(id=request_id, to_user=self, status='pending')
        request.status = 'accepted'
        request.save()

    def reject_friend_request(self, request_id):
        # フレンドリクエストを拒否
        request = FriendRequest.objects.get(id=request_id, to_user=self, status='pending')
        request.status = 'rejected'
        request.save()

    def remove_friend(self, friend):
        # フレンドを削除
        Friendship.objects.filter(user1=self, user2=friend).delete()
        Friendship.objects.filter(user1=friend, user2=self).delete()

        # 関連するフレンドリクエストを削除
        FriendRequest.objects.filter(from_user=self, to_user=friend).delete()
        FriendRequest.objects.filter(from_user=friend, to_user=self).delete()


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
