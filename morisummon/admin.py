from django.contrib import admin
from .models import Card, UserCard

class UserCardInline(admin.TabularInline):
    model = UserCard
    extra = 0

@admin.register(Card)
class CardAdmin(admin.ModelAdmin):
    list_display = ('name', 'hp', 'attack', 'image')
    inlines = [UserCardInline]
