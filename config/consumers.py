from channels.generic.websocket import AsyncWebsocketConsumer
from django.contrib.auth.models import AnonymousUser
from asgiref.sync import sync_to_async
import json
from morisummon.models import CustomUser, ChatGroup, ChatMessage

class ChatConsumer(AsyncWebsocketConsumer):
    user: CustomUser | AnonymousUser = None
    group_name = None

    async def connect(self):
        self.user = self.scope["user"]

        if self.user.is_anonymous:
            await self.close()
            return

        self.group_name = self.scope['url_route']['kwargs']['group_name']

        await self.channel_layer.group_add(
            self.group_name,
            self.channel_name
        )

        await self.accept()

        # 履歴取得後にクライアントに送信する場所
        messages = await sync_to_async(list)(
            ChatMessage.objects.filter(group__name=self.group_name).order_by('timestamp')
        )
        for message in messages:
            sender = await sync_to_async(lambda: message.sender)()
            await self.send(text_data=json.dumps({
                'message': message.message,
                'sender': {
                    'id': sender.id,
                    'name': sender.username,
                },
                'timestamp': message.timestamp.isoformat()
            }))

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            self.group_name,
            self.channel_name
        )

    async def receive(self, text_data=None):
        if text_data:
            data = json.loads(text_data)
            message = data.get('message')

            chat_group, created = await sync_to_async(ChatGroup.objects.get_or_create)(name=self.group_name)

            chat_message = await sync_to_async(ChatMessage.objects.create)(
                group=chat_group,
                sender=self.user,
                message=message
            )

            # データ形式はフロント側と形式を合わせた
            await self.channel_layer.group_send(
                self.group_name,
                {
                    'type': 'chat_message',
                    'message': message,
                    'sender': {
                        'id': self.user.id,
                        'name': self.user.username,
                    },
                    'timestamp': chat_message.timestamp.isoformat()
                }
            )

    async def chat_message(self, event):
        await self.send(text_data=json.dumps({
            'message': event['message'],
            'sender': event['sender'],
            'timestamp': event['timestamp']
        }))
