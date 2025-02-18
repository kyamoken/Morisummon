import json
import logging
from ulid import ULID
from channels.db import database_sync_to_async
from morisummon.utils import dictutil
from battle.models import BattleRoom, PlayerSet, BattlePlayerInfo, BattlePlayerStatus
from .base import BaseMixin

logger = logging.getLogger(__name__)

class BattlePreparingActionsMixin(BaseMixin):
    async def _create_new_room(self):
        """
        新しいバトル部屋を作成する
        """
        self.room_id = str(ULID())
        self.opponent_id = None

        room_data = BattleRoom(
            id=self.room_id,
            slug=self.room_slug,
            player1=PlayerSet(
                info=BattlePlayerInfo(
                    id=str(self.user.id),
                    name=self.user.username,
                    avatar=None,
                    is_owner=True,
                    is_connected=True,
                    channel_name=self.channel_name
                ),
                status=BattlePlayerStatus()
            ),
            player_map={str(self.user.id): "player1"},
            turn_player_id=str(self.user.id),
        )

        room_data.save()

    async def _is_user_joined(self, room: BattleRoom):
        """ユーザーが既に参加しているか確認する"""
        p1id = room.player1.info.id
        p2id = room.player2.info.id if room.player2 else None

        return str(self.user.id) in [p1id, p2id]

    async def _rejoin_room(self, room: BattleRoom):
        """再接続する"""
        self.room_id = room.id
        await self._set_player_connection_status(room, True)
        await self.save_room(room)

    async def _join_room(self, room: BattleRoom):
        """既存のバトルルームに参加する"""
        self.room_id = room.id

        if await self._is_user_joined(room):
            await self._rejoin_room(room)
            return

        if room.player2:
            # すでに2人いる場合は参加できない
            await self.accept()
            await self.send_json({
                "type": "error",
                "message": "この部屋は満員です"
            })
            await self.close()
            return

        room.player2 = PlayerSet(
            info=BattlePlayerInfo(
                id=str(self.user.id),
                name=self.user.username,
                avatar=None,
                is_owner=False,
                is_connected=True,
                channel_name=self.channel_name
            ),
            status=BattlePlayerStatus()
        )

        room.player_map[str(self.user.id)] = "player2"

        await self.save_room(room)
        await self._start_battle(room)


    async def _start_battle(self, room: BattleRoom):
        """バトルを開始する"""
        room.status = "progress"

        if str(self.user.id) == room.player1.info.id:
            self.player_id = room.player1.info.id
            self.opponent_id = room.player2.info.id
        else:
            self.player_id = room.player2.info.id
            self.opponent_id = room.player1.info.id

        # プレイヤーのステータスを初期化
        room.player1.status = BattlePlayerStatus()
        room.player2.status = BattlePlayerStatus()
        await self.save_room(room)
