from django.http import JsonResponse, Http404,HttpRequest, HttpResponseNotFound,HttpResponseBadRequest, HttpResponse
from django.core.exceptions import PermissionDenied
from django.views import View
from .models import Lobby
import json
from utils.decorators import token_validation
from utils.functions import get_user_obj
from django.db.models import Q
from user_profile.models import User
from user_profile.utils import get_avatar_data


class LobbyHandling(View):    
    @token_validation
    def get(self, request:HttpRequest):
        lobbies = Lobby.objects.all()
        lobby_owner_data = []
        for lobby in lobbies:
            player_count = 1  # Start with 1 to count the owner
            for player in [lobby.player_2, lobby.player_3, lobby.player_4]:
                if player != -1:
                    player_count += 1

            try:
                owner = User.objects.get(pk=lobby.owner)
                owner_data = {
                    'owner_id': owner.pk,
                    'owner_nickname': owner.nickname,
                    'owner_avatar': get_avatar_data(owner),
                    'player_count': player_count
                }
                lobby_owner_data.append(owner_data)
            except User.DoesNotExist:
                lobby_owner_data.append({
                    'owner_id': None,
                    'owner_nickname': 'Owner not found',
                    'player_count': player_count
                })

        return JsonResponse({"lobbies": lobby_owner_data})