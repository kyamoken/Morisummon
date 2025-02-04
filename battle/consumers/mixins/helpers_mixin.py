import json
from ulid import ULID
from channels.db import database_sync_to_async
from morisummon.utils import dictutil
from battle.models import BattleRoom, PlayerSet, BattlePlayerInfo, BattlePlayerStatus
from .base import BaseMixin

class BattleHelpersMixin(BaseMixin):
    """ データフォーマットなどの便利関数をまとめたMixin """
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
            )
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

    async def _set_player_connection_status(self, room: BattleRoom, is_connected: bool) -> None:
        """プレイヤーの接続状態を更新する"""
        if self.user.id != room.player1.info.id:
            if room.player2:
                room.player2.info.is_connected = is_connected
        else:
            room.player1.info.is_connected = is_connected

    @database_sync_to_async
    def _update_player_channel_name(self):
        """プレイヤーのチャネル名を更新する"""
        room = BattleRoom.objects.get(id=self.room_id)
        if str(self.user.id) == room.player1.info.id:
            room.player1.info.channel_name = self.channel_name
        else:
            room.player2.info.channel_name = self.channel_name
        room.save()

    def _format_battle_status(self, room: BattleRoom, user_set: PlayerSet) -> dict:
        data = json.loads(room.to_json())

        # player1, player2 を you, opponent に変更
        if room.player1.info.id == user_set.info.id:
            data["you"] = data["player1"]
            data["opponent"] = data["player2"]
        else:
            data["you"] = data["player2"]
            data["opponent"] = data["player1"]

        dictutil.delete(data, "player1")
        dictutil.delete(data, "player2")

        # 非公開情報を削除
        dictutil.delete(data, "you.status.private")
        dictutil.delete(data, "opponent.status.private")
        dictutil.delete(data, "opponent.status.hand_cards")
        dictutil.delete(data, "opponent.status._deck_cards")

        return data

    async def _send_battle_update(self):
        room = await self.get_room()

        if room.player1:
            player1_status = self._format_battle_status(room, user_set=room.player1)
            await self.channel_layer.send(
                room.player1.info.channel_name,
                {
                    "type": "battle.update",
                    "you_are": "player1",
                    "data": player1_status
                }
            )

        if room.player2:
            player2_status = self._format_battle_status(room, user_set=room.player2)
            await self.channel_layer.send(
                room.player2.info.channel_name,
                {
                    "type": "battle.update",
                    "you_are": "player2",
                    "data": player2_status
                }
            )
