from django.contrib import admin
from .models import Card, Deck, UserCard

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
