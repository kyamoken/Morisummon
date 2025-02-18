import logging
from .base import BaseMixin

class BattleEventMixin(BaseMixin):
    """ WebSocket イベント処理を担当するMixin """

    # 最新の状態を送信
    async def battle_update(self, event):
        await self.send_json({
            "type": "battle.update",
            "you_are": event["you_are"],
            "data": event["data"]
        })

    async def turn_change(self, event):
        await self.send_json({
            "type": "turn.change",
            "player_id": event["player_id"]
        })

    # チャットメッセージ
    async def chat_message(self, event):
        await self.send_json({
            "type": "chat.message",
            "user": event["user"],
            "message": event["message"]
        })

    # エラー・警告関連
    async def error(self, event):
        await self.send_json({
            "type": "error",
            "message": event["message"]
        })
    async def warning(self, event):
        await self.send_json({
            "type": "warning",
            "message": event["message"]
        })
