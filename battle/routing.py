from django.urls import path
from . import consumers

websocket_urlpatterns = [
    # path('ws/battle/search/', consumers.SearchBattleConsumer.as_asgi()),
    path('ws/battle/room/<str:keyphrase>/', consumers.BattleConsumer.as_asgi()),
]
