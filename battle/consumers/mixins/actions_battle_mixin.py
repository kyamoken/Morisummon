import json
import logging
from ulid import ULID
from channels.db import database_sync_to_async
from morisummon.utils import dictutil
from battle.models import (
    BattleRoom,
    PlayerSet,
    BattlePlayerInfo,
    BattlePlayerStatus,
    BattleCardInfo,
    BattleRoomStatus  # Enum
)
from .base import BaseMixin

logger = logging.getLogger(__name__)

class BattleActionsMixin(BaseMixin):
    async def _end_turn(self):
        room: BattleRoom = await self.get_room()
        user = await self.get_user()
        player = self.get_player(room, user)
        opponent = self.get_opponent(room, user)

        # 例：相手のエネルギーを1追加
        opponent.status.energy = 1

        # 埋め込みドキュメント更新
        if room.player1.info.id == opponent.info.id:
            room.player1.status = opponent.status
        else:
            room.player2.status = opponent.status

        # ターンを相手に渡す
        room.turn_player_id = opponent.info.id

        await self.save_room(room)
        await self._start_new_turn(room, opponent)
        await self._send_battle_update()

    async def _action_pass_turn(self):
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

    async def _start_new_turn(self, room: BattleRoom, next_player: PlayerSet):
        self._draw_cards(next_player, 1)
        await self.save_room(room)
        await self._send_battle_update()

    def _draw_cards(self, player: PlayerSet, count: int = 1):
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

    async def _action_attack(self, message):
        logger.debug("Received _action_attack message: %s", message)

        room: BattleRoom = await self.get_room()
        user = await self.get_user()
        player = self.get_player(room, user)
        opponent = self.get_opponent(room, user)

        # ターンチェック
        if room.turn_player_id != str(player.info.id):
            await self.send_json({
                "type": "warning",
                "message": "自分のターンではありません"
            })
            return

        if not player.status.battle_card:
            await self.send_json({
                "type": "warning",
                "message": "攻撃するメインカードがありません"
            })
            return

        if not opponent.status.battle_card:
            await self.send_json({
                "type": "warning",
                "message": "相手のメインカードが存在しません"
            })
            return

        # 受信メッセージから target_id を取得（相手カードに id が設定されている場合のみチェック）
        target_id = message.get("target_id")
        logger.debug("target_id from message: %s", target_id)
        card_id = getattr(opponent.status.battle_card, "id", None)
        logger.debug("Opponent battle card id: %s", card_id)
        if card_id is not None and target_id and target_id != card_id:
            await self.send_json({
                "type": "warning",
                "message": "無効な攻撃対象です"
            })
            return

        # プレイヤーのバトルカードから攻撃値を取得
        atk_value = getattr(player.status.battle_card, "attack", None)
        if atk_value is None:
            await self.send_json({
                "type": "warning",
                "message": "攻撃カードに攻撃値が設定されていません"
            })
            return

        logger.debug("攻撃力: %s", atk_value)

        # 相手のメインカードの HP を更新
        if opponent.status.battle_card.hp is None:
            opponent.status.battle_card.hp = 0
        old_hp = opponent.status.battle_card.hp
        opponent.status.battle_card.hp -= atk_value
        logger.debug("攻撃前のHP: %s → 攻撃後のHP: %s", old_hp, opponent.status.battle_card.hp)

        # 変更内容を保存
        await self.save_room(room)

        # 攻撃結果をチャットメッセージとして送信
        attack_msg = (
            f"{player.status.battle_card.name}が"
            f"{opponent.status.battle_card.name}に{atk_value}ダメージ！ "
            f"残HP: {opponent.status.battle_card.hp}"
        )
        await self.channel_layer.group_send(
            f"battle_rooms_{room.id}",
            {
                "type": "chat.message",
                "user": {"name": "システム"},
                "message": attack_msg,
            }
        )

        # HP が 0 以下の場合の処理
        if opponent.status.battle_card.hp <= 0:
            opponent.status.battle_card = None
            await self.send_json({
                "type": "info",
                "message": "相手のメインカードが倒れました。"
            })
            if opponent.status.bench_cards and len(opponent.status.bench_cards) > 0:
                new_main = opponent.status.bench_cards.pop(0)
                opponent.status.battle_card = new_main
                await self.send_json({
                    "type": "info",
                    "message": "相手のベンチカードがメインカードに昇格しました。"
                })
            else:
                room.status = "finished"
                room.winner = str(player.info.id)
                await self.send_json({
                    "type": "info",
                    "message": "相手はカードがなくなりました。あなたの勝ちです！"
                })

        # 最後にターン終了処理を実行（逃げる処理と同様のフロー）
        await self._end_turn()

    async def _action_escape(self, bench_index: int):
        room: BattleRoom = await self.get_room()
        user = await self.get_user()
        player = self.get_player(room, user)
        if room.turn_player_id != str(player.info.id):
            await self.send_json({
                "type": "warning",
                "message": "自分のターンではありません"
            })
            return
        if not player.status.battle_card:
            await self.send_json({
                "type": "warning",
                "message": "メインカードがありません"
            })
            return

        required_energy = player.status.battle_card.escape_needs_energy
        if player.status.battle_card.energy < required_energy:
            await self.send_json({
                "type": "warning",
                "message": "逃げに必要なエネルギーが足りません"
            })
            return

        player.status.battle_card.energy -= required_energy
        bench = player.status.bench_cards or []
        if bench_index < 0 or bench_index >= len(bench) or bench[bench_index] is None:
            await self.send_json({
                "type": "error",
                "message": "有効なベンチカードが選択されていません"
            })
            return

        temp = player.status.battle_card
        player.status.battle_card = bench[bench_index]
        bench[bench_index] = temp

        await self.save_room(room)
        await self._send_battle_update()

    async def _action_surrender(self):
        room: BattleRoom = await self.get_room()
        user = await self.get_user()
        player = self.get_player(room, user)
        opponent = self.get_opponent(room, user)
        room.status = "finished"
        room.winner = str(opponent.info.id)
        await self.save_room(room)
        await self._send_battle_update()
        await self.send_json({
            "type": "chat.message",
            "user": {"name": player.info.name},
            "message": "あなたは降参しました。"
        })
