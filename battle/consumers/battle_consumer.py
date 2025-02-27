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
from battle.consumers.mixins.actions_energy_mixin import BattleEnergyMixin
from battle.models import BattleRoom
from .mixins import *


logger = logging.getLogger(__name__)

class BattleConsumer(AsyncJsonWebsocketConsumer, BattleDBMixin, BattleEventMixin, BattleHelpersMixin, BattleActionsMixin, BattlePreparingActionsMixin, BattleEnergyMixin):
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

        if not room.winner:
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
            # (既存の処理)
            pass
        elif request_type == "action.pass":
            await self._action_pass_turn()
        elif request_type == "action.end_turn":
            forced = content.get("forced", False)
            await self._action_end_turn(forced)
        elif request_type == "action.assign_energy":
            card_id = content.get("card_id")
            await self._action_assign_energy(card_id)
        elif request_type == "action.place_card":
            card_index = content.get("card_index")
            to_field = content.get("to_field")
            await self._action_place_card(card_index, to_field)
        elif request_type == "action.setup_complete":
            await self._action_setup_complete()
        # 新規分岐
        elif request_type == "action.attack":
            target_type = content.get("targetType")
            logger.debug("攻撃アクション受信: %s", content)
            if target_type == "battleCard":
                await self._action_attack_battle_card()
            else:
                await self._action_attack(content)
        elif request_type == "action.escape":
            bench_index = content.get("bench_index")
            logger.debug(f"逃げアクション bench_index: {bench_index}")
            if bench_index is not None:
                await self._action_escape(bench_index)
            else:
                await self.send_json({
                    "type": "error",
                    "message": "bench_index が指定されていません"
                })
        elif request_type == "action.surrender":
            await self._action_surrender()
        else:
            await self.send_json({
                "type": "error",
                "message": "不明なアクションです"
            })
