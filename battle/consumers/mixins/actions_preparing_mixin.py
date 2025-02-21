import json
import logging
from random import shuffle
from ulid import ULID
from channels.db import database_sync_to_async
from morisummon.utils import dictutil
from battle.models import (
    BattleRoom,
    PlayerSet,
    BattlePlayerInfo,
    BattlePlayerStatus,
    BattleCardInfo
)
from .base import BaseMixin

# Djangoモデル（別アプリ）のインポート
from morisummon.models import Card, Deck

logger = logging.getLogger(__name__)


class BattlePreparingActionsMixin(BaseMixin):
    async def _create_new_room(self):
        """
        新しいバトル部屋を作成する
        ※初期状態を "setup" にして、カード配置フェーズとする
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
            ),
            player_map={str(self.user.id): "player1"},
            turn_player_id=None,  # ターン開始前
            status="setup"        # セットアップフェーズ
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
            # すでに2人いる場合は参加不可
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
        room.player_map[str(self.user.id)] = "player2"
        await self.save_room(room)
        await self._start_battle(room)

    async def _start_battle(self, room: BattleRoom):
        """
        バトル開始前の準備:
         ・各プレイヤーのデッキ情報を取得し、シャッフル後に初期ドロー（3枚）を実施
         ・クライアントにはセットアップフェーズのUIを表示
        """
        room.status = "setup"
        await self._initialize_deck_and_draw(room)
        await self.save_room(room)
        await self._send_battle_update()

    async def _initialize_deck_and_draw(self, room: BattleRoom):
        """
        各プレイヤーの Django モデルの Deck を取得し、
        シャッフル後に BattleCardInfo に変換して _deck_cards にセット、
        その後、初期ドロー（3枚）を _hand_cards に移す。
        """
        # player1 の処理
        if room.player1:
            deck_obj = await self._get_user_deck(room.player1.info.id)
            if deck_obj:
                await self._set_deck_cards(room.player1, deck_obj)
                self._draw_cards(room.player1, 3)
        # player2 の処理
        if room.player2:
            deck_obj = await self._get_user_deck(room.player2.info.id)
            if deck_obj:
                await self._set_deck_cards(room.player2, deck_obj)
                self._draw_cards(room.player2, 3)

    @database_sync_to_async
    def _get_user_deck(self, user_id: str):
        """
        Djangoモデル Deck からユーザーのデッキを取得
        """
        try:
            from django.contrib.auth import get_user_model
            User = get_user_model()
            user_obj = User.objects.get(id=int(user_id))
            return Deck.objects.filter(user=user_obj).first()
        except Exception as e:
            logger.error(f"Deck取得エラー user_id {user_id}: {e}")
            return None

    async def _set_deck_cards(self, player: PlayerSet, deck: Deck):
        """
        Deck.card_ids から Card 情報を取得し、BattleCardInfo に変換して
        プレイヤーの status._deck_cards にセットする
        """
        player.status._deck_cards = []
        card_data_list = deck.card_ids  # ここは int のリストの場合も、Card オブジェクトの場合もある
        shuffled_cards = list(card_data_list)
        shuffle(shuffled_cards)
        for card_data in shuffled_cards:
            if not card_data:
                continue
            # card_data が整数の場合は DB から取得、そうでなければ Card インスタンスと仮定
            if isinstance(card_data, int):
                try:
                    card_obj = await database_sync_to_async(Card.objects.get)(id=card_data)
                except Card.DoesNotExist:
                    continue
            else:
                card_obj = card_data  # 既に Card オブジェクトの場合
            bc = BattleCardInfo(
                id=str(card_obj.id),
                name=card_obj.name,
                image=card_obj.image.url if card_obj.image else None,
                energy=0,
                attack_needs_energy=card_obj.attack_cost,
                escape_needs_energy=card_obj.retreat_cost,
                hp=card_obj.hp,
                attack=card_obj.attack
            )
            player.status._deck_cards.append(bc)

    def _draw_cards(self, player: PlayerSet, count: int = 1):
        """
        プレイヤーの _deck_cards から指定枚数を取り出し、_hand_cards に追加する
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

    async def _action_place_card(self, card_index: int, to_field: str):
        room: BattleRoom = await self.get_room()
        user = await self.get_user()
        player = self.get_player(room, user)

        # BattleRoomStatus を使って状態を比較する
        from battle.models import BattleRoomStatus
        if room.status != BattleRoomStatus.SETUP:
            await self.send_json({
                "type": "warning",
                "message": "現在はカード配置フェーズではありません。"
            })
            return

        hand = player.status._hand_cards or []
        if card_index < 0 or card_index >= len(hand):
            await self.send_json({
                "type": "error",
                "message": "指定された手札のカードが存在しません。"
            })
            return

        card = hand.pop(card_index)
        if to_field == "battle_card":
            if player.status.battle_card:
                await self.send_json({
                    "type": "warning",
                    "message": "すでにメインカードが配置されています。"
                })
                hand.insert(card_index, card)
                return
            player.status.battle_card = card
        elif to_field == "bench":
            bench = player.status.bench_cards or []
            if len(bench) >= player.status.bench_cards_max:
                await self.send_json({
                    "type": "warning",
                    "message": "ベンチが満杯です。"
                })
                hand.insert(card_index, card)
                return
            bench.append(card)
            player.status.bench_cards = bench
        else:
            hand.insert(card_index, card)
            await self.send_json({
                "type": "error",
                "message": "無効な配置先です。"
            })
            return

        player.status.hand_cards_count = len(hand)
        await self.save_room(room)
        await self._send_battle_update()


    async def _action_setup_complete(self):
        """
        ユーザーが初期配置完了を宣言するアクション
        ※少なくとも1枚はカードを配置していることが必要
        ※両者完了している場合、room.status を IN_PROGRESS に変更し、ターン開始処理を実行する
        ※すでに準備完了中の場合は操作をブロックする
        """
        from battle.models import BattleRoomStatus

        room: BattleRoom = await self.get_room()
        user = await self.get_user()
        player = self.get_player(room, user)

        # すでに準備完了中の場合は操作をブロック
        if getattr(player.status, "setup_done", False):
            await self.send_json({
                "type": "warning",
                "message": "準備完了中には操作できません"
            })
            return

        if room.status != BattleRoomStatus.SETUP:
            await self.send_json({
                "type": "warning",
                "message": "現在はセットアップフェーズではありません。"
            })
            return

        if not player.status.battle_card and not player.status.bench_cards:
            await self.send_json({
                "type": "warning",
                "message": "少なくとも1枚はカードを配置してください。"
            })
            return

        # 自分の準備完了フラグを立てる
        player.status.setup_done = True
        await self.save_room(room)

        # 再取得して最新の状態にする
        room = await self.get_room()
        opponent = self.get_opponent(room, user)

        # デバッグ用ログ出力
        import logging
        logger = logging.getLogger(__name__)
        logger.debug(f"Player {player.info.id} setup_done: {player.status.setup_done}")
        logger.debug(f"Opponent {opponent.info.id if opponent else 'None'} setup_done: {getattr(opponent.status, 'setup_done', False)}")

        # 相手の準備完了フラグが立っている場合、対戦開始フェーズに移行
        if opponent and getattr(opponent.status, "setup_done", False):
            room.status = BattleRoomStatus.IN_PROGRESS
            room.turn_player_id = room.player1.info.id  # 例：player1 を先行とする
            await self.save_room(room)
            await self._start_new_turn(room, room.player1)
        else:
            await self.send_json({
                "type": "warning",
                "message": "相手の配置完了を待っています..."
            })

        await self._send_battle_update()




    async def _start_new_turn(self, room: BattleRoom, player: PlayerSet):
        """
        ターン開始時の処理：カードを1枚ドローする
        """
        self._draw_cards(player, 1)
        await self.save_room(room)
        await self._send_battle_update()
