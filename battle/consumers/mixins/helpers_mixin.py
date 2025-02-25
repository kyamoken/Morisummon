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

        # 対戦相手が存在しない場合、部屋の状態を "waiting" にして opponent を None に設定する
        if not room.player2:
            data["status"] = "waiting"
            data["opponent"] = None
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
        # 自分は内部フィールド _hand_cards の詳細を hand_cards にコピーして表示する
        your_status["hand_cards"] = your_status.get("_hand_cards", [])
        if "status" in data.get("you", {}):
            dictutil.delete(data["you"]["status"], "_hand_cards")

        # ----- 相手側の情報 -----
        const_opponent = data.get("opponent") or {}
        const_opponent_status = const_opponent.get("status", {})
        # 手札詳細は隠し、枚数のみ表示（hand_cards_count があれば利用、なければ _hand_cards の長さ）
        const_opponent_status[
            "hand_cards"] = f"{const_opponent_status.get('hand_cards_count', len(const_opponent_status.get('_hand_cards', [])))}枚"
        dictutil.delete(const_opponent_status, "_deck_cards")
        dictutil.delete(const_opponent_status, "private")

        # 部屋の状態に応じた相手の配置済みカードの表示内容を制御
        # セットアップフェーズの場合は詳細を伏せる（プレースホルダー表示）
        if room.status in ["setup", "SETUP"] or (hasattr(room.status, "name") and room.status.name.lower() == "setup"):
            if const_opponent_status.get("battle_card"):
                const_opponent_status["battle_card"] = {"placeholder": "配置済"}
            if const_opponent_status.get("bench_cards"):
                new_bench = []
                for card in const_opponent_status["bench_cards"]:
                    new_bench.append({"placeholder": "配置済"} if card else None)
                const_opponent_status["bench_cards"] = new_bench
        # 対戦フェーズ（IN_PROGRESS）なら、相手の配置済みカード情報はそのまま公開

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
