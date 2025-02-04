from channels.db import database_sync_to_async
from battle.models import BattleRoom
from .base import BaseMixin

class BattleDBMixin(BaseMixin):
    """ データベース操作関連の処理をまとめたMixin """

    @database_sync_to_async
    def get_user(self):
        """ユーザー情報を取得"""
        return self.scope['user']

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
