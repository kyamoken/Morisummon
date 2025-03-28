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

    async def _action_attack_battle_card(self):
        """
        相手のメインカードを攻撃するアクション。
        attack_needs_energy をチェックして足りない場合は攻撃不可とする。
        """
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

        # 攻撃側のメインカードチェック
        if not player.status.battle_card:
            await self.send_json({
                "type": "warning",
                "message": "攻撃するメインカードがありません"
            })
            return

        # 防御側のメインカードチェック
        if not opponent.status.battle_card:
            await self.send_json({
                "type": "warning",
                "message": "相手のメインカードが存在しません"
            })
            return

        # 攻撃に必要なエネルギー数を取得 # 追加
        required_energy = getattr(player.status.battle_card, "attack_needs_energy", 0)
        if player.status.battle_card.energy < required_energy:
            await self.send_json({
                "type": "warning",
                "message": "攻撃に必要なエネルギーが足りません"
            })
            return

        # 必要エネルギーを消費 # 追加
        # player.status.battle_card.energy -= required_energy

        # 攻撃値を取得
        atk_value = getattr(player.status.battle_card, "attack", None)
        if atk_value is None:
            await self.send_json({
                "type": "warning",
                "message": "攻撃カードに攻撃値が設定されていません"
            })
            return

        logger.debug("攻撃力: %s", atk_value)
        if opponent.status.battle_card.hp is None:
            opponent.status.battle_card.hp = 0
        old_hp = opponent.status.battle_card.hp
        opponent.status.battle_card.hp -= atk_value
        new_hp = opponent.status.battle_card.hp

        # 攻撃結果の通知
        attack_msg = (
            f"{player.status.battle_card.name} が "
            f"{opponent.status.battle_card.name} に {atk_value} ダメージ！ "
            f"(HP: {old_hp} → {new_hp})"
        )
        await self.channel_layer.group_send(
            f"battle_rooms_{room.id}",
            {
                "type": "chat.message",
                "user": {"name": "システム"},
                "message": attack_msg,
            }
        )

        # ノックアウト処理
        if new_hp <= 0:
            knocked_card_name = opponent.status.battle_card.name
            opponent.status.life -= 1
            await self.channel_layer.group_send(
                f"battle_rooms_{room.id}",
                {
                    "type": "chat.message",
                    "user": {"name": "システム"},
                    "message": f"相手の {knocked_card_name} が倒れました！"
                }
            )
            if opponent.status.life <= 0:
                room.status = BattleRoomStatus.FINISHED.value
                room.winner = str(player.info.id)
                await self.channel_layer.group_send(
                    f"battle_rooms_{room.id}",
                    {
                        "type": "chat.message",
                        "user": {"name": "システム"},
                        "message": "相手のHPが0になりました。あなたの勝ちです！"
                    }
                )
            else:
                # ベンチからメインカードを昇格
                if opponent.status.bench_cards and len(opponent.status.bench_cards) > 0:
                    new_main = opponent.status.bench_cards.pop(0)
                    opponent.status.battle_card = new_main
                    await self.channel_layer.group_send(
                        f"battle_rooms_{room.id}",
                        {
                            "type": "chat.message",
                            "user": {"name": "システム"},
                            "message": f"相手のベンチカード {new_main.name} がメインカードに昇格しました！"
                        }
                    )
                else:
                    room.status = BattleRoomStatus.FINISHED.value
                    room.winner = str(player.info.id)
                    await self.channel_layer.group_send(
                        f"battle_rooms_{room.id}",
                        {
                            "type": "chat.message",
                            "user": {"name": "システム"},
                            "message": "相手はメインカードがなく、ベンチカードもありません。あなたの勝ちです！"
                        }
                    )

        # 変更内容を保存
        await self.save_room(room)
        # ターン終了
        await self._end_turn()

    async def _action_attack(self, message):
        """
        target_id が指定されるタイプの攻撃アクション。
        こちらも同様に attack_needs_energy をチェックしてから攻撃する。
        """
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

        # 攻撃に必要なエネルギーチェック # 追加
        required_energy = getattr(player.status.battle_card, "attack_needs_energy", 0)
        if player.status.battle_card.energy < required_energy:
            await self.send_json({
                "type": "warning",
                "message": "攻撃に必要なエネルギーが足りません"
            })
            return

        # 必要エネルギーを消費 # 追加
        # player.status.battle_card.energy -= required_energy

        # ターゲットチェック
        target_id = message.get("target_id")
        card_id = getattr(opponent.status.battle_card, "id", None)
        if card_id is not None and target_id and target_id != card_id:
            await self.send_json({
                "type": "warning",
                "message": "無効な攻撃対象です"
            })
            return

        # 攻撃値を取得
        atk_value = getattr(player.status.battle_card, "attack", None)
        if atk_value is None:
            await self.send_json({
                "type": "warning",
                "message": "攻撃カードに攻撃値が設定されていません"
            })
            return

        # ダメージ処理
        old_hp = opponent.status.battle_card.hp or 0
        opponent.status.battle_card.hp = old_hp - atk_value
        logger.debug("攻撃前のHP: %s → 攻撃後のHP: %s", old_hp, opponent.status.battle_card.hp)

        # 攻撃結果メッセージ
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

        # HP が 0 以下の場合
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

        # 更新を保存
        await self.save_room(room)
        # 攻撃後はターン終了
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
        room.status = BattleRoomStatus.FINISHED.value
        room.winner = str(opponent.info.id)
        await self.save_room(room)
        await self._send_battle_update()

        await self.send_json({
            "type": "chat.message",
            "user": {"name": player.info.name},
            "message": "あなたは降参しました。"
        })

        await self.channel_layer.send(
            opponent.info.channel_name,
            {
                "type": "chat.message",
                "user": {"name": "システム"},
                "message": "相手が降参を選びました！"
            }
        )
