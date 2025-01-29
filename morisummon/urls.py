from django.urls import re_path, path
from . import views

urlpatterns = [
    re_path(r'^(?!api/|admin/).*$', views.index, name='index'),
    path('api/csrf-token/', views.csrf_token, name='csrf_token'),

    path('api/auth/login/', views.login, name='login'),
    path('api/auth/register/', views.register, name='register'),
    path('api/auth/me/', views.me, name='me'),
    path('api/auth/logout/', views.logout_view, name='logout'),

    path('api/get-cards/', views.user_cards, name='user_cards'),
    path('api/save-deck/', views.save_deck, name='deck_list'),
    path('api/get-deck/', views.get_deck, name='get_deck'),

    path('api/gacha/', views.gacha, name='gacha'),

    path('api/chat/<str:group_name>/messages/', views.get_chat_messages, name='chat_messages'),
    path('api/chat/groups/', views.get_chat_groups, name='get_chat_groups'),
    path('api/chat/groups/create/', views.create_chat_group, name='create_chat_group'),
    path('api/chat/groups/<str:group_name>/add-user/', views.add_user_to_group, name='add_user_to_group'),

]
    # ユーザー
    # path('api/users/', views.custom_user_list, name='custom_user_list'),
    # path('api/users/<int:pk>/', views.custom_user_detail, name='custom_user_detail'),

