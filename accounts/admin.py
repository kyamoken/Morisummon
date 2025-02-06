from django.contrib import admin
from .models import User

# Register your models here.
@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ('username', 'email', 'magic_stones')
    search_fields = ('username', 'email')
    list_filter = ('magic_stones',)
    fieldsets = (
        (None, {
            'fields': ('username', 'email', 'magic_stones')
        }),
    )
