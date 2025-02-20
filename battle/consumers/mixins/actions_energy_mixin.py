import logging
from .base import BaseMixin
from battle.models import BattleRoom, BattleCardInfo
logger = logging.getLogger(__name__)

class BattleEnergyMixin(BaseMixin):
    async def _action_assign_energy(self, card_id: str):
        """
        プレイヤーがエネルギーをカードに割り振るアクション

        :param card_id: 割り振り対象のカード識別子（例："bench-0"ならベンチ0番目、
                         "battle_card"または"main"ならアクティブカード）
        """
        room: BattleRoom = await self.get_room()
        user = await self.get_user()
        player = self.get_player(room, user)

        if room.turn_player_id != str(player.info.id):
            await self.send_json({
                "type": "warning",
                "message": "自分のターンではありません"
            })
            return

        # 利用可能エネルギーが足りるかチェック
        if player.status.energy <= 0:
            await self.send_json({
                "type": "warning",
                "message": "利用可能なエネルギーがありません"
            })
            return

        # エネルギー1を利用可能エネルギーから差し引く
        player.status.energy -= 1

        # カード識別子により対象カードを決定する
        if card_id.startswith("bench-"):
            try:
                index = int(card_id.split("-")[1])
            except (IndexError, ValueError):
                await self.send_json({
                    "type": "error",
                    "message": "無効なカード識別子です"
                })
                return

            if index >= len(player.status.bench_cards):
                await self.send_json({
                    "type": "error",
                    "message": "指定されたベンチカードは存在しません"
                })
                return

            # 対象カードのエネルギーを1増加
            card = player.status.bench_cards[index]
            card.energy = (card.energy or 0) + 1
            logger.debug(f"Player {player.info.id} assigned energy to bench card {index}")

        elif card_id == "battle_card" or card_id.startswith("main"):
            # アクティブなバトルカードに割り当てる
            if not player.status.battle_card:
                # ダミーデータを作成して割り当てる（実際のモデル定義に合わせた形式）
                dummy_card = BattleCardInfo(
                    id="dummy_001",
                    name="ジャスティス",
                    image="/static/images/cards/card01.png",
                    energy=0,
                    attack_needs_energy=1,
                    escape_needs_energy=2,
                    hp=100,
                    attack=50
                )
                player.status.battle_card = dummy_card
            card = player.status.battle_card
            card.energy = (card.energy or 0) + 1
            logger.debug(f"Player {player.info.id} assigned energy to battle card")
        else:
            await self.send_json({
                "type": "error",
                "message": "無効なカード識別子です"
            })
            return

        await self.save_room(room)
        await self._send_battle_update()
