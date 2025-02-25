import json
import logging
from ulid import ULID
from channels.db import database_sync_to_async
from morisummon.utils import dictutil
from battle.models import BattleRoom, PlayerSet, BattlePlayerInfo, BattlePlayerStatus
from .base import BaseMixin

logger = logging.getLogger(__name__)

class BattleActionsMixin(BaseMixin):
    async def _end_turn(self):
        """
        共通のターン終了処理。
        現在のプレイヤーから相手にターンを渡し、相手のターンを開始する。
        """
        room: BattleRoom = await self.get_room()
        user = await self.get_user()
        player = self.get_player(room, user)
        opponent = self.get_opponent(room, user)

        # 相手のエネルギーを1追加する例
        opponent.status.energy = 1

        # 埋め込みドキュメントの変更を検知させるための再代入
        if room.player1.info.id == opponent.info.id:
            room.player1.status = opponent.status
        else:
            room.player2.status = opponent.status

        # ターンを相手に渡す
        room.turn_player_id = opponent.info.id

        # ルームを保存
        await self.save_room(room)

        # ここで相手のターンを開始（カードを1枚ドロー）
        await self._start_new_turn(room, opponent)

        # 最後に全体更新を送る
        await self._send_battle_update()

    async def _action_pass_turn(self):
        """
        手動で「pass」コマンドが入力された場合のターン終了処理。
        """
        room: BattleRoom = await self.get_room()
        user = await self.get_user()
        player = self.get_player(room, user)

        if room.turn_player_id != str(player.info.id):
            await self.send_json({
                "type": "warning",
                "message": "現在相手のターンです"
            })
            return

        logger.debug(f"Player {player.info.id} is passing the turn")
        await self._end_turn()

    async def _action_end_turn(self, forced: bool = False):
        """
        任意のタイミングでターンを終了するアクション。
        forced が True の場合、攻撃後など強制的なターン終了として利用できる想定。
        """
        room: BattleRoom = await self.get_room()
        user = await self.get_user()
        player = self.get_player(room, user)

        if room.turn_player_id != str(player.info.id):
            await self.send_json({
                "type": "warning",
                "message": "現在相手のターンです"
            })
            return

        logger.debug(f"Player {player.info.id} is ending turn {'forcibly' if forced else 'voluntarily'}")
        await self._end_turn()

    # ▼▼▼ ここから追加 ▼▼▼
    async def _start_new_turn(self, room: BattleRoom, next_player: PlayerSet):
        """
        ターン開始時の処理：カードを1枚ドローする
        """
        self._draw_cards(next_player, 1)
        await self.save_room(room)
        await self._send_battle_update()

    def _draw_cards(self, player: PlayerSet, count: int = 1):
        """
        山札 (_deck_cards) から指定枚数ドローし、手札 (_hand_cards) に加える
        """
        if not player.status._deck_cards:
            return
        if not player.status._hand_cards:
            player.status._hand_cards = []

        for _ in range(count):
            if not player.status._deck_cards:
                break
            card = player.status._deck_cards.pop(0)
            player.status._hand_cards.append(card)

        player.status.hand_cards_count = len(player.status._hand_cards)


