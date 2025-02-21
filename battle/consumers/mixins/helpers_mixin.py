import json
from ulid import ULID
from channels.db import database_sync_to_async
from morisummon.utils import dictutil
from battle.models import BattleRoom, PlayerSet, BattlePlayerInfo, BattlePlayerStatus
from .base import BaseMixin

class BattleHelpersMixin(BaseMixin):
    """ データフォーマットなどの便利関数をまとめたMixin """

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

        # 自分の手札情報を内部フィールド _hand_cards から hand_cards にコピー
        your_status = data["you"]["status"]
        your_status["hand_cards"] = your_status.get("_hand_cards", [])
        dictutil.delete(data, "you.status._hand_cards")

        # 相手の非公開情報は削除
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
