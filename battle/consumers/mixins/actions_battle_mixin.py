import json
import logging
from ulid import ULID
from channels.db import database_sync_to_async
from morisummon.utils import dictutil
from battle.models import BattleRoom, PlayerSet, BattlePlayerInfo, BattlePlayerStatus
from .base import BaseMixin

logger = logging.getLogger(__name__)

class BattleActionsMixin(BaseMixin):
    async def _action_pass_turn(self):
        room: BattleRoom | None = await self.get_room()
        user = await self.get_user()
        player = self.get_player(room, user)
        opponent = self.get_opponent(room, user)

        logger.debug(f"Player {player.info.id}, Opponent {opponent.info.id}, Current {room.turn_player_id}")

        if room.turn_player_id != str(player.info.id):
            await self.send_json({
                "type": "warning",
                "message": "現在相手のターンです"
            })
            return

        logger.debug(f"User {player.info.id} is passing the turn")

        room.turn_player_id = opponent.info.id

        await self.save_room(room)

        await self._send_battle_update()

