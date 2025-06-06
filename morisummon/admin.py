from django.contrib import admin
from .models import Card, Deck, UserCard, ChatGroup, ChatMessage, FriendRequest, Friendship

admin.site.site_header = "Morisummon Admin"

class UserCardInline(admin.TabularInline):
    model = UserCard
    extra = 0

@admin.register(Card)
class CardAdmin(admin.ModelAdmin):
    list_display = ('name', 'hp', 'attack', 'image', 'retreat_cost', 'attack_cost', 'type', 'category','attack_name', 'pack', 'ability')
    search_fields = ('name',)
    list_filter = ('hp', 'attack')
    inlines = [UserCardInline]

@admin.register(UserCard)
class UserCardAdmin(admin.ModelAdmin):
    list_display = ('user', 'card', 'amount')
    search_fields = ('user__username', 'card__name')
    list_filter = ('amount',)

@admin.register(Deck)
class DeckAdmin(admin.ModelAdmin):
    list_display = ('user', 'card_ids')
    search_fields = ('user__username',)
    list_filter = ('user',)

@admin.register(ChatGroup)
class ChatGroupAdmin(admin.ModelAdmin):
    list_display = ('name', 'created_at')
    search_fields = ('name',)
    list_filter = ('created_at',)

@admin.register(ChatMessage)
class ChatMessageAdmin(admin.ModelAdmin):
    list_display = ('group', 'sender', 'message', 'timestamp')
    search_fields = ('group__name', 'sender__username', 'message')
    list_filter = ('timestamp',)

@admin.register(FriendRequest)
class FriendRequestAdmin(admin.ModelAdmin):
    list_display = ('from_user', 'to_user', 'status', 'created_at')
    search_fields = ('from_user__username', 'to_user__username')
    list_filter = ('status', 'created_at')

@admin.register(Friendship)
class FriendshipAdmin(admin.ModelAdmin):
    list_display = ('user1', 'user2', 'created_at')
    search_fields = ('user1__username', 'user2__username')
    list_filter = ('created_at',)


