from django.http import JsonResponse
from ulid import ULID
from battle.models import BattleRoom
from rest_framework.decorators import api_view

# Create your views here.
@api_view(["GET"])
def get_room_slug(request):
    room = BattleRoom.objects.filter(player2=None).first()
    if room:
        return JsonResponse({"found": True, "slug": room.slug})
    else:
        new_slug = str(ULID())
        return JsonResponse({"found": False, "slug": new_slug})
