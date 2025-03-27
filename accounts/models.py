from django.core.exceptions import ValidationError
from django.db import models
from django.contrib.auth.models import AbstractUser
from morisummon.models import Friendship, FriendRequest

# Create your models here.
class User(AbstractUser):
    magic_stones = models.IntegerField(default=100)

    def __str__(self):
        return self.username

    def get_friends(self):
        # ユーザーのフレンド一覧を取得
        friendships1 = Friendship.objects.filter(user1=self).values_list('user2', flat=True)
        friendships2 = Friendship.objects.filter(user2=self).values_list('user1', flat=True)
        friends_ids = set(friendships1).union(set(friendships2))
        friends = User.objects.filter(id__in=friends_ids)
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

