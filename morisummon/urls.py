from django.urls import re_path, path
from . import views

urlpatterns = [
    re_path(r'^(?!api/|admin/).*$', views.index, name='index'),
    path('api/csrf-token/', views.csrf_token, name='csrf_token'),

    path('api/auth/login/', views.login, name='login'),
    path('api/auth/register/', views.register, name='register'),
    path('api/auth/me/', views.me, name='me'),
    path('api/auth/logout/', views.logout_view, name='logout'),
    path('api/gacha/', views.gacha, name='gacha'),
    path('api/user-cards', views.user_cards, name='user-cards'),
    path('api/save-deck/', views.save_deck, name='deck_list'),
    path('api/get-deck/', views.get_deck, name='get_deck'),

    # ユーザー
    # path('api/users/', views.custom_user_list, name='custom_user_list'),
    # path('api/users/<int:pk>/', views.custom_user_detail, name='custom_user_detail'),
]
