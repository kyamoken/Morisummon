from django.urls import re_path
from config import consumers
from battle.routing import websocket_urlpatterns as battle_websocket_urlpatterns

websocket_urlpatterns = [
    re_path(r'ws/somepath/$', consumers.YourConsumer.as_asgi()),

    *battle_websocket_urlpatterns,

]
