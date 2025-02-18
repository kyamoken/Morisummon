from typing import Literal
from channels.db import database_sync_to_async
from accounts.models import User
from battle.models import BattleRoom
from .base import BaseMixin

class BattleDBMixin(BaseMixin):
    """ データベース操作関連の処理をまとめたMixin """

    @database_sync_to_async
    def get_user(self):
        """ユーザー情報を取得"""
        return self.scope['user']

    def get_player(self, room: BattleRoom, user: User) -> BattleRoom:
        """プレイヤーを取得"""
        return room.player1 if str(user.id) == room.player1.info.id else room.player2

    def get_opponent(self, room: BattleRoom, user: User) -> BattleRoom:
        """相手プレイヤーを取得"""
        return room.player2 if str(user.id) == room.player1.info.id else room.player1

    def get_opponent_id(self, room: BattleRoom) -> str:
        """相手プレイヤーのIDを取得"""
        return self.get_opponent(room).info.id

    @database_sync_to_async
    def get_user_index(self, room: BattleRoom) -> Literal[1, 2]:
        """ユーザーがどのプレイヤーかを取得"""
        return 1 if room.player_map[str(self.user.id)] == "player1" else 2

    @database_sync_to_async
    def get_user_index_str(self, room: BattleRoom) -> Literal["player1", "player2"]:
        """ユーザーがどのプレイヤーかを取得"""
        return room.player_map[str(self.user.id)]

    @database_sync_to_async
    def get_room(self, id: str = None):
        """バトルルームを取得"""
        if id:
            return BattleRoom.objects.get(id=id)
        return BattleRoom.objects.get(slug=self.room_slug)

    @database_sync_to_async
    def save_room(self, room: BattleRoom):
        """バトルルームを保存"""
        room.save()

    @database_sync_to_async
    def delete_room(self, room_id: str):
        """バトルルームを削除"""
        BattleRoom.objects.filter(id=room_id).delete()
