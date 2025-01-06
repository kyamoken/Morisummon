# morisummons/routing.py
from django.urls import re_path
from config import consumers

websocket_urlpatterns = [
    re_path(r'ws/somepath/$', consumers.YourConsumer.as_asgi()),
]