from django.http import JsonResponse, HttpResponseForbidden, HttpResponse, Http404, HttpResponseBadRequest
from django.views import View
from django.db.models import Q
from .models import Tournament, User
import json
from utils.functions import get_user_obj
from utils.decorators import token_validation
from django.core.exceptions import PermissionDenied
from django.utils import timezone

class UserTournamentView(View):
    @token_validation
    def post(self, request):
        try:
            user_requesting = get_user_obj(request)
        except User.DoesNotExist:
            return JsonResponse({"error": "User not found"}, status=404)
        except PermissionDenied:
            return JsonResponse({"error": "Couldn't locate access jwt"}, status=403)
        if Tournament.objects.filter(owner=user_requesting, status__in=[Tournament.WAITING_FOR_PLAYERS, Tournament.FULL, Tournament.STARTED]).exists():
            return JsonResponse({"error": "You have an ongoing tournament that's not finished"}, status=403)

        new_tournament = Tournament(owner=user_requesting)
        new_tournament.last_update_time = timezone.now()
        new_tournament.save()
        new_tournament.players.add(user_requesting)

        return JsonResponse({"message": "Tournament updated successfully"})

    @token_validation
    def get(self, request):
        try:
            user_requesting = get_user_obj(request)
        except User.DoesNotExist:
            return JsonResponse({"error": "User not found"}, status=404)
        except PermissionDenied:
            return JsonResponse({"error": "Couldn't locate access jwt"}, status=403)

        owned_tournaments = list(Tournament.objects.filter(owner=user_requesting).values('status'))
        participating_tournaments = list(user_requesting.tournamentPlayer.all().values('status', 'owner'))
        return JsonResponse({
            "owned_tournaments": owned_tournaments,
            "participating_tournaments": participating_tournaments
        })
    
    @token_validation
    def patch(self, request):
        try:
            user_requesting = get_user_obj(request)
        except User.DoesNotExist:
            return JsonResponse({"error": "User not found"}, status=404)
        except PermissionDenied:
            return JsonResponse({"error": "Couldn't locate access jwt"}, status=403)

        tournament = Tournament.objects.filter(owner=user_requesting, status__in=[Tournament.WAITING_FOR_PLAYERS, Tournament.FULL, Tournament.STARTED]).first()
        if not tournament:
            return JsonResponse({"error": "You have no current tournament to update."}, status=404)

        try:
            data = json.loads(request.body)
        except json.JSONDecodeError:
            return JsonResponse({"error": "Invalid json"}, status=400)
        
        if 'players' in data:
            for player_id in data['players']:
                try:
                    player = User.objects.get(pk=player_id)
                    tournament.players.add(player)
                except User.DoesNotExist:
                    return JsonResponse({"error": f"User with id {player_id} not found"}, status=404)

        if 'status' in data and data['status'] in [Tournament.WAITING_FOR_PLAYERS, Tournament.FULL, Tournament.STARTED, Tournament.FINISH]:
            tournament.status = data['status']
            tournament.last_update_time = timezone.now()
            tournament.save()
        elif 'status' in data:
            return JsonResponse({"error": "Invalid status"}, status=400)

        return JsonResponse({"message": "Tournament updated successfully"}, status=200)
            

# To get all tournament in the database. For <Join Tournament> Modal
class ActiveTournamentsView(View):
    pass