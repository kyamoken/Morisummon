from abc import ABC, abstractmethod
import logging
from channels.generic.websocket import AsyncJsonWebsocketConsumer
from django.contrib.auth.models import AnonymousUser
from accounts.models import User
from battle.consumers.mixins.actions_battle_mixin import BattleActionsMixin
from battle.consumers.mixins.actions_preparing_mixin import BattlePreparingActionsMixin
from battle.consumers.mixins.db_mixin import BattleDBMixin
from battle.consumers.mixins.event_mixin import BattleEventMixin
from battle.consumers.mixins.helpers_mixin import BattleHelpersMixin
from battle.models import BattleRoom
from .mixins import *

logger = logging.getLogger(__name__)

class BattleConsumer(AsyncJsonWebsocketConsumer, BattleDBMixin, BattleEventMixin, BattleHelpersMixin, BattleActionsMixin, BattlePreparingActionsMixin):
    room_id: str
    room_slug: str
    user: User | AnonymousUser = None

    # Websocket 接続時の処理
    async def connect(self):
        self.user = await self.get_user()
        self.room_slug = self.scope['url_route']['kwargs']['slug']
        logger.info(f"User {self.user} connected to battle room {self.room_slug}")
        logger.info(f"Channel name: {self.channel_name}")

        if self.user.is_anonymous:
            # ログインしていない場合は接続を拒否
            await self.accept()
            await self.send_json({
                "type": "error",
                "message": "ログインしてください"
            })
            await self.close()
            return

        try:
            room = await self.get_room()
            await self._join_room(room)
        except BattleRoom.DoesNotExist:
            await self._create_new_room()

        if not self.room_id:
            await self.close()
            return

        await self.channel_layer.group_add(f"battle_rooms_{self.room_id}", self.channel_name)
        await self.accept()

        await self._send_battle_update()

    # Websocket 接続切断時の処理
    async def disconnect(self, close_code):
        if "room_id" not in self.__dict__ or not self.room_id:
            return

        await self.channel_layer.group_discard(f"battle_rooms_{self.room_id}", self.channel_name)
        room = await self.get_room()

        if room.player1:
            channel_name = room.player1.info.channel_name
            await self.channel_layer.send(channel_name, {
                "type": "error",
                "message": "相手が切断しました"
            })

        if room.player2:
            channel_name = room.player2.info.channel_name
            await self.channel_layer.send(channel_name, {
                "type": "error",
                "message": "相手が切断しました"
            })

        await self.delete_room(self.room_id)

    # Websocket メッセージ受信時の処理
    async def receive_json(self, content, **kwargs):
        request_type = content.get("type")
        if request_type == "chat.message":
            await self.channel_layer.group_send(
                f"battle_rooms_{self.room_id}",
                {
                    "type": "chat.message",
                    "user": {
                        "name": self.user.username,
                    },
                    "message": content.get("message")
                }
            )
        elif request_type == "action.pass":
            await self._action_pass_turn()
        elif request_type == "action.end_turn":
            # フロント側から forced フラグを渡すことで、
            # 将来的に攻撃後の自動終了処理と区別できるようにしておく
            forced = content.get("forced", False)
            await self._action_end_turn(forced)
