# signals.py
from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import FriendRequest, Friendship, Notification


@receiver(post_save, sender=FriendRequest)
def create_friendship(sender, instance, **kwargs):
    if instance.status == 'accepted':
        # フレンドリクエストが承認された場合、Friendshipモデルにレコードを追加
        Friendship.objects.get_or_create(user1=instance.from_user, user2=instance.to_user)
        Friendship.objects.get_or_create(user1=instance.to_user, user2=instance.from_user)

@receiver(post_save, sender=FriendRequest)
def create_notification(sender, instance, created, **kwargs):
    if created:
        message = f'{instance.from_user.username} からフレンドリクエストが届きました。'
        Notification.objects.create(user=instance.to_user, message=message)
