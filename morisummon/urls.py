from django.urls import re_path, path
from . import views

urlpatterns = [
    re_path(r'^(?!api/|admin/).*$', views.index, name='index'),
    path('api/csrf-token/', views.csrf_token, name='csrf_token'),

    # 認証
    path('api/auth/login/', views.login, name='login'),
    path('api/auth/me/', views.me, name='me'),
    path('api/auth/logout/', views.logout_view, name='logout'),

    # ユーザー
    # path('api/users/', views.custom_user_list, name='custom_user_list'),
    # path('api/users/<int:pk>/', views.custom_user_detail, name='custom_user_detail'),
]
