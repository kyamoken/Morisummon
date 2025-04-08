from django.contrib import admin
from django.utils import timezone
from datetime import timedelta
from .models import User

@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = (
        'username',
        'email',
        'magic_stones',
        'login_bonus_last_date',
        'login_bonus_streak',
    )
    search_fields = ('username', 'email')
    list_filter = ('magic_stones',)
    fieldsets = (
        (None, {
            'fields': (
                'username',
                'email',
                'magic_stones',
                'login_bonus_last_date',
                'login_bonus_streak',
            )
        }),
    )
    actions = ['award_login_bonus']

    @admin.action(description='選択されたユーザーにログインボーナスを手動で付与する')
    def award_login_bonus(self, request, queryset):
        today = timezone.localdate()
        yesterday = today - timedelta(days=1)
        awarded_count = 0

        for user in queryset:
            # 本日すでにボーナスが付与されているユーザーはスキップ
            if user.login_bonus_last_date == today:
                continue

            # 連続ログインかどうかを判断（前日のボーナス取得があれば継続、なければ1日にリセット）
            if user.login_bonus_last_date == yesterday:
                user.login_bonus_streak += 1
            else:
                user.login_bonus_streak = 1

            # ボーナスの計算：1日目～7日目は「連続日数×10」、8日目以降は毎日100個
            if user.login_bonus_streak <= 7:
                bonus = user.login_bonus_streak * 10
            else:
                bonus = 100

            user.magic_stones += bonus
            user.login_bonus_last_date = today
            user.save()
            awarded_count += 1

        self.message_user(request, f'{awarded_count} ユーザーにログインボーナスを付与しました。')
