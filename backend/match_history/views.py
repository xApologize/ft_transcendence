from django.http import JsonResponse, Http404,HttpRequest, HttpResponseNotFound,HttpResponseBadRequest, HttpResponse
from django.core.exceptions import PermissionDenied
from django.views import View
from .models import User, MatchHistory
import json
from utils.decorators import token_validation
from utils.functions import get_user_obj
from django.db.models import Q


class MatchHistoryView(View):
    @token_validation
    def post(self, request: HttpRequest):
        try:
            gameData = json.loads(request.body)
            user = get_user_obj(request)
        except json.JSONDecodeError:
            return HttpResponseBadRequest("Invalid JSON.")
        except PermissionDenied as e:
            return HttpResponse(str(e), status=401)
        except Http404 as e:
            return HttpResponseNotFound(str(e))

        if user.nickname != gameData['winner'] and user.nickname != gameData['loser']:
            return HttpResponseBadRequest("The user who is sending the request must be the winner or the loser.")
        try:
            winner_nickname = gameData['winner']  # It's the nickname of the winner user
            loser_nickname = gameData['loser']  # It's the nickname of the loser user
            winner_score = int(gameData['winner_score'])
            loser_score = int(gameData['loser_score'])
            
            if winner_nickname == loser_nickname:
                return HttpResponseBadRequest("Winner and loser can't be the same user.")
        
            winner = User.objects.get(nickname=winner_nickname)
            loser = User.objects.get(nickname=loser_nickname)

            # Create and save the match history
            match = MatchHistory(
                winner=winner,
                loser=loser,
                winner_score=winner_score,
                loser_score=loser_score
            )
            match.save()

            return JsonResponse({'message': 'Match history added successfully!'})

        except User.DoesNotExist:
            return HttpResponseBadRequest("One of the users does not exist.")
        except ValueError:
            return HttpResponseBadRequest("Scores must be integers.")
        except Exception as e:
            return HttpResponse(str(e), status=500)

    @token_validation
    def get(self, request: HttpRequest):
        try:
            user = get_user_obj(request)
        except PermissionDenied as e:
            return HttpResponse(str(e), status=401)
        except Http404 as e:
            return HttpResponseNotFound(str(e))

        try:
            recent_played_matches = MatchHistory.objects.filter(
                Q(winner=user) | Q(loser=user)
            ).order_by('-date_of_match')

            data = {
                'won_matches': [
                    {
                        'winner_score': match.winner_score,
                        'loser_score': match.loser_score,
                        'date_of_match': match.date_of_match.strftime("%Y/%m/%d")
                    }
                    for match in recent_played_matches if match.winner == user
                ],
                'lost_matches': [
                    {
                        'winner_score': match.winner_score,
                        'loser_score': match.loser_score,
                        'date_of_match': match.date_of_match.strftime("%Y/%m/%d")
                    }
                    for match in recent_played_matches if match.loser == user
                ],
                'played_matches': [
                    {
                        'winner_score': match.winner_score,
                        'winner_username': match.winner.nickname,
                        'loser_score': match.loser_score,
                        'loser_username': match.loser.nickname,
                        'date_of_match': match.date_of_match.strftime("%Y/%m/%d")
                    }
                    for match in recent_played_matches
                ]
            }

            return JsonResponse(data)

        except Exception as e:
            return HttpResponseBadRequest(str(e))
        
        