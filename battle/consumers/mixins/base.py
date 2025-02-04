from abc import ABC, abstractmethod
from typing import Literal

class BaseMixin(ABC):
    scope: dict
    groups: list
    channel_name: str
    channel_layer: dict
    channel_layer_alias: Literal["default"]

    room_id: str
    room_slug: str

    @abstractmethod
    async def connect(self):
        pass

    @abstractmethod
    async def disconnect(self, close_code):
        pass

    @abstractmethod
    async def receive(self, text_data=None, bytes_data=None):
        pass

    @abstractmethod
    async def send(self, text_data=None, bytes_data=None, close=False):
        pass

    @abstractmethod
    async def receive_json(self, content):
        pass

    @abstractmethod
    async def send_json(self, content):
        pass

    @abstractmethod
    async def accept(self, subprotocol=None, headers=None):
        pass

    @abstractmethod
    async def close(self, code=None, reason=None):
        pass
