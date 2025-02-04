from django.urls import path
from .consumers import battle_consumer

websocket_urlpatterns = [
    # path('ws/battle/find/', consumers.SearchBattleConsumer.as_asgi()),
    path('ws/battle/room/<str:slug>/', battle_consumer.BattleConsumer.as_asgi()),
]
