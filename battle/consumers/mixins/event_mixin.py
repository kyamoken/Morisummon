import logging
from .base import BaseMixin

class BattleEventMixin(BaseMixin):
    """ WebSocket イベント処理を担当するMixin """

    async def battle_update(self, event):
        await self.send_json({
            "type": "battle.update",
            "you_are": event["you_are"],
            "data": event["data"]
        })

    async def chat_message(self, event):
        await self.send_json({
            "type": "chat.message",
            "user": event["user"],
            "message": event["message"]
        })

    async def error(self, event):
        await self.send_json({
            "type": "error",
            "message": event["message"]
        })
