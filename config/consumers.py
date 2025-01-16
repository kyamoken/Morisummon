from channels.generic.websocket import AsyncWebsocketConsumer
import json
from django.contrib.auth.models import AnonymousUser

from morisummon.models import CustomUser

# 接続中のユーザーを保持するリスト
active_users = []

class YourConsumer(AsyncWebsocketConsumer):
    user: CustomUser | AnonymousUser = None

    async def connect(self):
        self.user = self.scope["user"]

        if self.user.is_anonymous:
            # ログインしていない場合は接続を拒否
            await self.close()

        # 接続を許可
        await self.accept()

        # 接続されたときはactive_usersに追加
        active_users.append(self)

    async def disconnect(self, close_code):
        # 切断されたときはactive_usersから削除
        active_users.remove(self)

    async def receive(self, text_data=None):
        if text_data:
            data = json.loads(text_data)

            res = json.dumps({
                'user': {
                    'id': self.user.id,
                    'name': self.user.username,
                },
                'message': data.get('message')
            })

            for user in active_users:
                await user.send(text_data=res)
