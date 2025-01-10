from rest_framework import serializers
from django.contrib.auth.models import User
# from django.conf import settings

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        exclude = ['password']
