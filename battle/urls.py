from django.urls import path
from . import views

app_name = 'battle'

urlpatterns = [
    path('api/battle/claim-slug/', views.get_room_slug),
]
