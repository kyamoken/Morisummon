from django.urls import path
from . import views

app_name = 'accounts'

urlpatterns = [
    path('api/csrf-token/', views.csrf_token, name='csrf_token'),
    path('api/auth/login/', views.login, name='login'),
    path('api/auth/register/', views.register, name='register'),
    path('api/auth/me/', views.me, name='me'),
    path('api/auth/logout/', views.logout_view, name='logout'),

    path('api/login_bonus/', views.login_bonus, name='login_bonus'),
]
