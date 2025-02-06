from rest_framework.permissions import BasePermission
from rest_framework.permissions import IsAuthenticated
from rest_framework.permissions import IsAdminUser

class IsAnonymousUser(BasePermission):
    """
    ログインしていないユーザーのみ許可するパーミッションクラス
    """
    def has_permission(self, request, view):
        return bool(not request.user or not request.user.is_authenticated)
