from django.contrib import admin
from django.contrib.auth import get_user_model
from .models import Card, Deck, UserCard

User = get_user_model()

class UserCardInline(admin.TabularInline):
    model = UserCard
    extra = 0

@admin.register(Card)
class CardAdmin(admin.ModelAdmin):
    list_display = ('name', 'hp', 'attack', 'image')
    inlines = [UserCardInline]

@admin.register(UserCard)
class UserCardAdmin(admin.ModelAdmin):
    pass

@admin.register(Deck)
class DeckAdmin(admin.ModelAdmin):
    pass

@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ('username', 'email', 'magic_stones')
    fields = ('username', 'email', 'magic_stones')
