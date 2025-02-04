from django.contrib import admin
from django.contrib.auth import get_user_model
from .models import Card, Deck, UserCard, ChatGroup, CustomUser, ChatMessage, FriendRequest, Friendship, ExchangeSession

User = get_user_model()

class UserCardInline(admin.TabularInline):
    model = UserCard
    extra = 0

@admin.register(Card)
class CardAdmin(admin.ModelAdmin):
    list_display = ('name', 'hp', 'attack', 'image')
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

class ExchangeSessionAdmin(admin.ModelAdmin):
    list_display = ('exchange', 'initiator_ready', 'receiver_ready')
    search_fields = ('exchange__id',)

admin.site.register(ExchangeSession, ExchangeSessionAdmin)

