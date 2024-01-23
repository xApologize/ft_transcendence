from .models import User
from django.db.utils import IntegrityError
from django.http import JsonResponse, HttpResponse, HttpResponseNotFound, HttpResponseBadRequest, HttpRequest, Http404
from match_history.models import MatchHistory
from django.views import View
from utils.decorators import token_validation, verify_cookies
from utils.functions import get_user_obj
from django.contrib.auth.hashers import make_password
from friend_list.models import FriendList
import json, os
from django.db.models import Q
from django.core.exceptions import PermissionDenied, ValidationError
from django.conf import settings
from .utils import get_avatar_data, check_info_update, validate_image, check_info_signup
from django_otp.plugins.otp_totp.models import TOTPDevice
from interactive.consumers import send_refresh
from asgiref.sync import async_to_sync


# https://stackoverflow.com/questions/3290182/which-status-code-should-i-use-for-failed-validations-or-invalid-duplicates


class Users(View):
    # Get All Users or specific users
    @token_validation
    def get(self, request: HttpRequest):
        status = request.GET.getlist('status')
        nicknames = request.GET.getlist('nickname')
        userID = request.GET.get('id')

        if not nicknames and not status and not userID:
            return HttpResponseBadRequest('No parameter.')

        if userID:
            if not userID.isdigit():
                return HttpResponseBadRequest('Invalid id.')
            try:
                users = User.objects.filter(id__in=[int(userID)])
            except User.DoesNotExist:
                return HttpResponseNotFound('User not found')
        elif nicknames:
            users = User.objects.filter(nickname__in=nicknames)
        elif status:
            users = User.objects.filter(status__in=status)

        user_data = []
        for user in users:
            data = {
                'id': user.id,
                'nickname': user.nickname,
                'email': user.email,
                'avatar': get_avatar_data(user),
                'status': user.status
            }

            if id:  # Process recent matches only when a specific user is requested
                recent_played_matches = MatchHistory.objects.filter(
                    Q(winner=user) | Q(loser=user)
                ).order_by('-date_of_match')

                data['won_matches'] = [
                    {'winner_score': match.winner_score, 'loser_score': match.loser_score, 'date_of_match': match.date_of_match.strftime("%Y/%m/%d")} 
                    for match in recent_played_matches if match.winner == user
                ]

                data['lost_matches'] = [
                    {'winner_score': match.winner_score, 'loser_score': match.loser_score, 'date_of_match': match.date_of_match.strftime("%Y/%m/%d")} 
                    for match in recent_played_matches if match.loser == user
                ]

                data['played_matches'] = [
                    {'winner_score': match.winner_score, 'winner_username': match.winner.nickname, 'loser_score': match.loser_score, 'loser_username': match.loser.nickname, 'date_of_match': match.date_of_match.strftime("%Y/%m/%d")} 
                    for match in recent_played_matches
                ]

            user_data.append(data)

        return JsonResponse({'users': user_data}, status=200)


    # Create a user
    # Check quoi a été passer en param?
    @verify_cookies
    def post(self, request: HttpRequest):
        try:
            user_data = json.loads(request.body)
            required_fields = ['nickname', 'email', 'password', 'passwordConfirm']
            checkup = check_info_signup(user_data, required_fields)
            if checkup is not None:
                return checkup
            if user_data['password'] != user_data['passwordConfirm']:
                return HttpResponseBadRequest('Passwords do not match')
            try:
                user = User.objects.create(
                    nickname=user_data['nickname'],
                    email=user_data['email'],
                    avatar='',
                    status='OFF',
                    password=make_password(user_data['password']),
                    admin=False,
                    two_factor_auth=False,
                )
                user.save()
            except IntegrityError:
                return HttpResponseBadRequest(f'Username {user_data["nickname"]} is already taken.') # 400    
        except json.JSONDecodeError:
            return HttpResponseBadRequest('Invalid JSON data in the request body') # 400
        response: HttpResponse =  HttpResponse(f'User {user_data["nickname"]} created successfully', status=201)
        return response

    # def delete(self, request: HttpRequest):
    #     nickname = request.GET.get('nickname')
    #     if not nickname:
    #         return HttpResponseBadRequest('No nickname provided for deletion.') # 400
    #     user = User.objects.filter(nickname=nickname).first()
    #     if not user:
    #         return HttpResponseNotFound(f'No user found with the nickname: {nickname}') # 404
    #     user.delete()
    #     return HttpResponse(status=204)


    # update specific user
    @token_validation
    def patch(self, request: HttpRequest):
        allowed_fields = {'nickname', 'email', 'status'}
        try:
            data = json.loads(request.body)
            if checkAllowedField(data, allowed_fields) is False:
                return HttpResponseBadRequest('Invalid JSON data in the request body.')
            user = get_user_obj(request)
        except PermissionDenied as e:
            return HttpResponse(str(e), status=401)
        except Http404 as e:
            return HttpResponse(str(e), status=404)
        except json.JSONDecodeError:
            return HttpResponseBadRequest('Invalid JSON data in the request body.') # 400
        
        try:
            checkup = check_info_update(data, allowed_fields)
            if checkup is not None:
                return checkup

            for field in allowed_fields:
                if field in data:
                    if not data[field] == getattr(user, field):
                        setattr(user, field, data[field])
                    else:
                        return HttpResponseBadRequest(f'Your {field} is already {getattr(user, field)}')
                    
            user.save()
            async_to_sync(send_refresh)(user.pk)
            return JsonResponse({
                "message": "User updated successfully.",
                "user": {
                    'nickname': user.nickname,
                    'email': user.email,
                }
            }, status=200)

        except IntegrityError:
            return HttpResponseBadRequest(f'Nickname is already in use.') # 400
        except Exception as e:
            return HttpResponseBadRequest(f'Unexpected Error: {e}') # 400


class Me(View):
    @token_validation
    def get(self, request: HttpRequest):
        try:
            user = get_user_obj(request)
        except PermissionDenied as e:
            return HttpResponse(str(e), status=401)
        except Http404 as e:
            return HttpResponse(str(e), status=404)
        
        recent_played_matches = MatchHistory.objects.filter(
            Q(winner=user) | Q(loser=user)
        ).order_by('-date_of_match')[:10]
        recent_won_matches = [match for match in recent_played_matches if match.winner == user]
        recent_lost_matches = [match for match in recent_played_matches if match.loser == user]

        avatar_data = get_avatar_data(user)
        user_data = {
            'id': user.pk,
            'nickname': user.nickname,
            'email': user.email,
            'avatar': avatar_data,
            'status': user.status,
            'admin': user.admin,
            'won_matches': [
                {'winner_score': match.winner_score, 'loser_score': match.loser_score, 'date_of_match': match.date_of_match.strftime("%Y/%m/%d")} 
                for match in recent_won_matches
            ],
            'lost_matches': [
                {'winner_score': match.winner_score, 'loser_score': match.loser_score, 'date_of_match': match.date_of_match.strftime("%Y/%m/%d")} 
                for match in recent_lost_matches
            ],
            'played_matches': [
                {'winner_score': match.winner_score, 'winner_username': match.winner.nickname, 'loser_score': match.loser_score, 'loser_username': match.loser.nickname, 'date_of_match': match.date_of_match.strftime("%Y/%m/%d")} 
                for match in recent_played_matches
            ],
        }
        # Determine the 2FA status
        two_factor_status = None  # Default to no auth
        totp_device = TOTPDevice.objects.filter(user=user).first()
        if totp_device:
            if totp_device.confirmed:
                two_factor_status = True  # Auth is confirmed
            else:
                two_factor_status = False  # Auth exists but is not confirmed

        user_data['two_factor_auth'] = two_factor_status
        return JsonResponse({'users': user_data}, status=200)


class Friends(View):
    @token_validation
    def get(self, request):
        try:
            user = get_user_obj(request)
        except PermissionDenied as e:
            return HttpResponse(str(e), status=401)
        except Http404 as e:
            return HttpResponse(str(e), status=404)
        friend_list = FriendList.objects.filter(
            Q(friend1=user, status="ACCEPTED") | Q(friend2=user, status="ACCEPTED")
        )
        friends = []
        for entry in friend_list:
            if entry.friend1.nickname == user.nickname:
                friends.append(entry.friend2)
            else:
                friends.append(entry.friend1)

        user_data = [
            {
                'id': user.id,
                'nickname': user.nickname,
                'email': user.email,
                'avatar': get_avatar_data(user),
                'status': user.status,
            }
            for user in friends
        ]
        if user_data:
            return JsonResponse({'users': user_data}, status=200)
        return HttpResponse('No friends found') # 404

class Upload(View):
    @token_validation
    def post(self, request: HttpRequest):
        try:
            user = get_user_obj(request)
        except PermissionDenied as e:
            return HttpResponse(str(e), status=401)
        except Http404 as e:
            return HttpResponse(str(e), status=404)

        try:
            if 'avatar' in request.FILES:
                file = request.FILES['avatar']
                file_extension = os.path.splitext(file.name)[1]
                new_file_name = f"user_{user.id}{file_extension}"

                # Validate the new avatar first
                try:
                    validate_image(file)
                except ValidationError as e:
                    return HttpResponseBadRequest(f"{str(e.message)}")

                # Delete the old avatar if validation is successful
                avatar_dir = os.path.join(settings.MEDIA_ROOT, 'avatars')
                for item in os.listdir(avatar_dir):
                    if item.startswith(f"user_{user.id}"):
                        os.remove(os.path.join(avatar_dir, item))

                # Save the new avatar
                user.avatar.save(new_file_name, file)
                avatar_url = get_avatar_data(user)
                async_to_sync(send_refresh)(user.pk)
                return JsonResponse({'message': 'Avatar updated successfully.', 'avatar_url': avatar_url}, status=200)
            else:
                return HttpResponseBadRequest('No avatar provided.')  # 400
        except Exception as e:
            return HttpResponseBadRequest('Unexpected Error: ' + str(e))  # 400


def checkAllowedField(data, allowed_fields):
    for field in data:
        if field not in allowed_fields:
            return False
    return True