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

    path('api/friends/', views.get_friends, name='get_friends'),
    path('api/friends/request/', views.send_friend_request, name='send_friend_request'),
    path('api/friends/requests/', views.get_friend_requests, name='get_friend_requests'),
    path('api/friends/requests/<int:request_id>/', views.handle_friend_request, name='handle_friend_request'),
    path('api/friends/<int:friend_id>/', views.remove_friend, name='remove_friend'),

    path('api/notifications/', views.get_notifications, name='get_notifications'),
    path('api/notifications/<int:notification_id>/', views.mark_notification_as_read, name='mark_notification_as_read'),
    path('api/notifications/unread_count/', views.get_unread_notification_count, name='get_unread_notification_count'),

    path('api/exchanges/', views.create_exchange, name='create_exchange'),
    path('api/exchanges/<int:exchange_id>/cancel/', views.cancel_exchange, name='cancel_exchange'),
    path('api/exchanges/<int:exchange_id>/', views.get_exchange_details, name='get_exchange_details'),
    path('api/exchanges/<int:exchange_id>/select_card/', views.select_card, name='select_card'),
    path('api/exchanges/<int:exchange_id>/confirm/', views.confirm_exchange, name='confirm_exchange'),
    path('api/cards/<int:card_id>/', views.get_card_details, name='get_card_details'),

]
    # ユーザー
    # path('api/users/', views.custom_user_list, name='custom_user_list'),
    # path('api/users/<int:pk>/', views.custom_user_detail, name='custom_user_detail'),

