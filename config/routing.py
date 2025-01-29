from django.urls import re_path
from config import consumers
from battle.routing import websocket_urlpatterns as battle_websocket_urlpatterns

websocket_urlpatterns = [
    # 既存のルーティング
    # re_path(r'ws/somepath/$', consumers.YourConsumer.as_asgi()),

    # チャット用のルーティング
    re_path(r'ws/chat/(?P<group_name>\w+)/$', consumers.ChatConsumer.as_asgi()),

    # バトル用のルーティング
    *battle_websocket_urlpatterns,
]
