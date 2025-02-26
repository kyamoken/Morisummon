# battle/consumers/mixins/helpers_mixin.py

import json
from ulid import ULID
from channels.db import database_sync_to_async
from morisummon.utils import dictutil
from battle.models import BattleRoom, PlayerSet, BattlePlayerInfo, BattlePlayerStatus, BattleRoomStatus
from .base import BaseMixin

class BattleHelpersMixin(BaseMixin):
    """
    BattleHelpersMixin
    ・BattleRoom の情報を JSON 化し、各プレイヤー用に整形して送信する。
    ・セットアップフェーズでは、相手の配置済みカード情報は { "placeholder": "配置済" } に置き換え、
      手札は枚数のみを表示する。
    ・対戦フェーズ（IN_PROGRESS）では、相手のカード情報はそのまま詳細を公開する。
    """

    async def _set_player_connleection_status(self, room: BattleRoom, is_connected: bool) -> None:
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

        # opponent情報がない場合は waiting 状態にして opponent を空の辞書にする
        if not data.get("player2"):
            data["status"] = "waiting"
            data["opponent"] = {}
            return data

        # 自分と相手の情報を入れ替える
        if room.player1.info.id == user_set.info.id:
            data["you"] = data["player1"]
            data["opponent"] = data["player2"]
        else:
            data["you"] = data["player2"]
            data["opponent"] = data["player1"]

        dictutil.delete(data, "player1")
        dictutil.delete(data, "player2")

        # ----- 自分側の情報 -----
        your_status = data.get("you", {}).get("status", {})
        your_status["hand_cards"] = your_status.get("_hand_cards", [])
        if "status" in data.get("you", {}):
            dictutil.delete(data["you"]["status"], "_hand_cards")

        # ----- 相手側の情報 -----
        # ここで opponent は必ず空ではないと仮定できる
        opponent = data.get("opponent") or {}
        opponent_status = opponent.get("status", {})
        # 手札詳細は隠して枚数のみ表示
        hand_count = opponent_status.get("hand_cards_count", len(opponent_status.get("_hand_cards", [])))
        opponent_status["hand_cards"] = f"{hand_count}枚"
        dictutil.delete(opponent_status, "_deck_cards")
        dictutil.delete(opponent_status, "private")

        # セットアップフェーズの場合、相手の配置済みカード情報を伏せる
        if room.status in ["setup", "SETUP"] or (hasattr(room.status, "name") and room.status.name.lower() == "setup"):
            if opponent_status.get("battle_card"):
                opponent_status["battle_card"] = {"placeholder": "配置済"}
            if opponent_status.get("bench_cards"):
                new_bench = []
                for card in opponent_status["bench_cards"]:
                    new_bench.append({"placeholder": "配置済"} if card else None)
                opponent_status["bench_cards"] = new_bench

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
