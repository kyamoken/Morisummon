# morisummons/consumers.py
from channels.generic.websocket import AsyncWebsocketConsumer
import json

class YourConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        await self.accept()

    async def disconnect(self, close_code):
        pass

    async def receive(self, text_data=None, bytes_data=None):
        if text_data:
            data = json.loads(text_data)
            await self.send(text_data=json.dumps({
                'message': 'Received your message!'
            }))