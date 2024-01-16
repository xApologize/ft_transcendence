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
from django.shortcuts import get_object_or_404


class GetAllLobbies(View):    
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
    
class GetMyLobby(View):
    @token_validation
    def get(self, request:HttpRequest):
        try:
            user = get_user_obj(request)
            userID = user.pk
        except User.DoesNotExist:
            return HttpResponseBadRequest({'error': "User not found"})
        except PermissionDenied:
            return HttpResponseBadRequest({'error': "Invalid token"})
        lobby = Lobby.objects.filter(
            Q(owner=userID) | 
            Q(player_2=userID) | 
            Q(player_3=userID) | 
            Q(player_4=userID)
            ).first()
        if not lobby:
            return HttpResponseBadRequest({'error': "Lobby not found"})
        player_fields = ['owner', 'player_2', 'player_3', 'player_4']
        lobby_data = {field: get_user(getattr(lobby, field)) for field in player_fields}
        return JsonResponse({"lobby": lobby_data})

def get_user(userID):
    if userID == -1:
        return None
    try:
        user_obj = get_object_or_404(User, pk=userID)
    except Http404:
        return None
    return {
        'id': user_obj.pk,
        'nickname': user_obj.nickname,
        'avatar': get_avatar_data(user_obj)
    }

class GetPlayerNbrInSpecificLobby(View):
    @token_validation
    def get(self, request:HttpRequest):
        owner_id = request.GET.get('owner_id')
        try:
            lobby = Lobby.get(owner=owner_id)
        except Lobby.DoesNotExist:
            return HttpResponseNotFound({'error': "Lobby not found"})
        player_fields = ['owner', 'player_2', 'player_3', 'player_4']
        player_nbr = 0
        for field in player_fields:
            if getattr(lobby, field) != -1:
                player_nbr += 1
        return JsonResponse({"player_nbr": player_nbr})
