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
        現在のプレイヤーから相手にターンを渡し、更新通知を送信する。
        ※ターン終了時に、相手のエネルギーを1追加する処理を実装
        """
        room: BattleRoom = await self.get_room()
        user = await self.get_user()
        player = self.get_player(room, user)
        opponent = self.get_opponent(room, user)

        # 相手のエネルギーを1追加する
        opponent.status.energy = 1

        # 埋め込みドキュメントの変更を検知させるために、埋め込みフィールドを再代入する
        if room.player1.info.id == opponent.info.id:
            room.player1.status = opponent.status
        else:
            room.player2.status = opponent.status

        # ターンを相手に渡す
        room.turn_player_id = opponent.info.id

        await self.save_room(room)
        await self._send_battle_update()

    async def _action_pass_turn(self):
        """
        現在は手動で「pass」コマンドが入力された場合のターン終了処理。
        """
        room: BattleRoom = await self.get_room()
        user = await self.get_user()
        player = self.get_player(room, user)
        opponent = self.get_opponent(room, user)

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
        （現状は forced の値に関わらず同じ処理ですが、将来的に条件分岐など追加可能）
        """
        room: BattleRoom = await self.get_room()
        user = await self.get_user()
        player = self.get_player(room, user)
        opponent = self.get_opponent(room, user)

        if room.turn_player_id != str(player.info.id):
            await self.send_json({
                "type": "warning",
                "message": "現在相手のターンです"
            })
            return

        logger.debug(f"Player {player.info.id} is ending turn {'forcibly' if forced else 'voluntarily'}")
        await self._end_turn()
