from django.urls import re_path, path
from . import views

urlpatterns = [
    re_path(r'^.*$', views.index, name='index'),
    path('api/users/', views.custom_user_list, name='custom_user_list'),
    path('api/users/<int:pk>/', views.custom_user_detail, name='custom_user_detail'),
]
