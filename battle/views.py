from django.http import JsonResponse
from ulid import ULID
from battle.models import BattleRoom
from rest_framework.decorators import api_view
from morisummon.models import Deck


@api_view(["GET"])
def get_room_slug(request):
    if not request.user.is_authenticated:
        return JsonResponse({"error": "ログインしてください"}, status=401)

    deck = Deck.objects.filter(user=request.user).first()
    if not deck or len(deck.card_ids) != 12:
        return JsonResponse({"error": "デッキが12枚編成されていません。編成後、再度対戦をお試しください。"}, status=516)

    room = BattleRoom.objects.filter(player2=None).first()
    if room:
        return JsonResponse({"found": True, "slug": room.slug})
    else:
        new_slug = str(ULID())
        return JsonResponse({"found": False, "slug": new_slug})
