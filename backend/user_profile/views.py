from .models import User
from django.db.utils import IntegrityError
from django.http import JsonResponse, HttpResponseForbidden, HttpResponse, Http404, HttpResponseNotFound, HttpResponseBadRequest, HttpRequest
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from match_history.models import MatchHistory
from django.views import View
from utils.decorators import token_validation
from utils.functions import add_double_jwt, decrypt_user_id, first_token
import json
from django.shortcuts import get_object_or_404
from django.db.models import Q


@method_decorator(csrf_exempt, name='dispatch') #- to apply to every function in the class.
class Users(View):
    # Get All Users or specific users
    @token_validation
    def get(self, request: HttpRequest):
        status = request.GET.getlist('status')
        nicknames = request.GET.getlist('nickname')
        if not nicknames and not status:
            return HttpResponseBadRequest('No parameter.')

        if nicknames:
            users = User.objects.filter(nickname__in=nicknames)
        elif status:
            users = User.objects.filter(status__in=status)
        user_data = [
            {
                'nickname': user.nickname,
                'email': user.email,
                'avatar': user.avatar,
                'status': user.status,
                'admin': user.admin,
            }
            for user in users
        ]
        if user_data:
            return JsonResponse({'users': user_data}, status=200)
        return HttpResponseNotFound('User not found') # 404


    # Create a user
    # Check quoi a été passer en param?
    def post(self, request: HttpRequest):
        try:
            user_data = json.loads(request.body)
            required_fields = ['nickname', 'email', 'avatar', 'password']
            extra_fields = user_data.keys() - required_fields
            if extra_fields:
                error_message = f'Unexpected fields: {", ".join(extra_fields)}'
                return HttpResponseBadRequest(error_message) # 400
            try:
                # not empty
                if any(user_data.get(field, '') == '' for field in ['nickname', 'email', 'avatar', 'password']):
                    return HttpResponseBadRequest('Missing one or more required fields') # 400
                # does not contain space
                if any(' ' in user_data.get(field, '') for field in ['nickname', 'email', 'avatar', 'password']):
                    return HttpResponseBadRequest('Field contain space') # 400
                user = User.objects.create(
                    nickname=user_data['nickname'],
                    email=user_data['email'],
                    avatar=user_data['avatar'],
                    status='OFF',
                    admin=False,
                    password=user_data['password']
                )
                user.save()
            except IntegrityError:
                return HttpResponseBadRequest(f'User {user_data["nickname"]} already exists') # 400    
        except json.JSONDecodeError:
            return HttpResponseBadRequest('Invalid JSON data in the request body') # 400
        # Added jwt when creating user. Refacto needed
        response: HttpResponse =  HttpResponse(f'User {user_data["nickname"]} created successfully', status=201)
        return response
        # primary_key = User.objects.get(nickname=user.nickname).pk
        # return first_token(response, primary_key)

    # Delete a specific users
    def delete(self, request: HttpRequest):
        nickname = request.GET.get('nickname')
        if not nickname:
            return HttpResponseBadRequest('No nickname provided for deletion.') # 400
        user = User.objects.filter(nickname=nickname).first()
        if not user:
            return HttpResponseNotFound(f'No user found with the nickname: {nickname}') # 404
        user.delete()
        return HttpResponse(status=204)


    # update specific user
    def patch(self, request: HttpRequest):
        nickname = request.GET.get('nickname')
        if not nickname:
            return HttpResponseBadRequest('No nickname provided for update.') # 400
        user = User.objects.filter(nickname=nickname).first()
        if not user:
            return HttpResponseNotFound(f'No user found with the nickname: {nickname}') # 404
        try:
            user_data = json.loads(request.body)
            for field in ['nickname', 'email', 'avatar', 'status', 'admin']:
                if field in user_data:
                    setattr(user, field, user_data[field])
            user.save()
        except json.JSONDecodeError:
            return HttpResponseBadRequest('Invalid JSON data in the request body.') # 400
        except IntegrityError:
            return HttpResponseBadRequest(f'Nickname {user_data["nickname"]} is already in use.') # 400
        return HttpResponse(f'User with nickname {nickname} updated successfully.', status=200)

@method_decorator(csrf_exempt, name='dispatch') #- to apply to every function in the class.
class Me(View):
    @token_validation
    def get(self, request: HttpRequest):
        refresh_jwt_cookie = request.COOKIES.get("refresh_jwt")
        if refresh_jwt_cookie is None:
            return HttpResponse("Couldn't locate cookie jwt", status=401)
        decrypt_result: int = decrypt_user_id(refresh_jwt_cookie)
        if decrypt_result > 0:
            user = get_object_or_404(User, id=decrypt_result)

            # Fetch won, lost, and played matches
            won_matches = user.winner.all()
            lost_matches = user.loser.all()
            played_matches = MatchHistory.objects.filter(Q(winner=user) | Q(loser=user))

            user_data = {
                'nickname': user.nickname,
                'email': user.email,
                'avatar': user.avatar,
                'status': user.status,
                'admin': user.admin,
                'won_matches': [{'winner_score': match.winner_score, 'loser_score': match.loser_score, 'date_of_match': match.date_of_match} for match in won_matches],
                'lost_matches': [{'winner_score': match.winner_score, 'loser_score': match.loser_score, 'date_of_match': match.date_of_match} for match in lost_matches],
                'played_matches': [{'winner_score': match.winner_score, 'loser_score': match.loser_score, 'date_of_match': match.date_of_match} for match in played_matches],
            }
            return JsonResponse({'users': user_data}, status=200)
        return HttpResponseBadRequest("Error access token", status=401)
        