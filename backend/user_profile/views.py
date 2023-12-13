from .models import User
from django.db.utils import IntegrityError
from django.http import JsonResponse, HttpResponse, HttpResponseNotFound, HttpResponseBadRequest, HttpRequest, Http404
from django.utils.decorators import method_decorator
from match_history.models import MatchHistory
from django.views import View
from utils.decorators import token_validation
from utils.functions import get_user_obj
from friend_list.models import FriendList
import json, os,base64,mimetypes
from django.db.models import Q
from django.core.exceptions import PermissionDenied, ValidationError
from django.conf import settings
from django.core.files.storage import default_storage
from django.contrib.auth.hashers import make_password

DEFAULT_AVATAR_URL = "avatars/default.png"

# https://stackoverflow.com/questions/3290182/which-status-code-should-i-use-for-failed-validations-or-invalid-duplicates


def get_image_as_base64(image_path):
    with default_storage.open(image_path, 'rb') as image_file:
        return base64.b64encode(image_file.read()).decode('utf-8')

def get_avatar_data(user):
    if user.avatar:
        avatar_base64 = get_image_as_base64(user.avatar.name)
        content_type, _ = mimetypes.guess_type(user.avatar.name)
    else:
        avatar_base64 = get_image_as_base64(DEFAULT_AVATAR_URL)
        content_type, _ = mimetypes.guess_type(DEFAULT_AVATAR_URL)

    if content_type is None:
        content_type = 'image/jpeg'
    return f'data:{content_type};base64,{avatar_base64}'


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
                'avatar': get_avatar_data(user),
                'status': user.status,
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
            required_fields = ['nickname', 'email', 'password', 'passwordConfirm']
            extra_fields = user_data.keys() - required_fields
            if extra_fields:
                error_message = f'Unexpected fields: {", ".join(extra_fields)}'
                return HttpResponseBadRequest(error_message) # 400
            elif user_data['password'] != user_data['passwordConfirm']:
                return HttpResponseBadRequest('Passwords do not match')
            try:
                # not empty
                if any(user_data.get(field, '') == '' for field in ['nickname', 'email', 'password', 'passwordConfirm']):
                    return HttpResponseBadRequest('Missing one or more required fields') # 400
                # does not contain space
                if any(' ' in user_data.get(field, '') for field in ['nickname', 'email', 'password', 'passwordConfirm']):
                    return HttpResponseBadRequest('Field contain space') # 400
                user = User.objects.create(
                    nickname=user_data['nickname'],
                    email=user_data['email'],
                    avatar='',
                    status='OFF',
                    admin=False,
                    password=make_password(user_data['password'])
                )
                user.save()
            except IntegrityError:
                return HttpResponseBadRequest(f'Username {user_data["nickname"]} is already taken.') # 400    
        except json.JSONDecodeError:
            return HttpResponseBadRequest('Invalid JSON data in the request body') # 400
        response: HttpResponse =  HttpResponse(f'User {user_data["nickname"]} created successfully', status=201)
        return response
        # Added jwt when creating user. Refacto needed
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
    @token_validation
    def patch(self, request: HttpRequest):
        try:
            user = get_user_obj(request)
            if "demo-user" == user.nickname or "demo-user2" == user.nickname:
                return HttpResponseBadRequest('Demo user cannot be updated.') # 400
        except PermissionDenied as e:
            return HttpResponse(str(e), status=401)
        except Http404 as e:
            return HttpResponse(str(e), status=404)
        try:
            data = json.loads(request.body)
            # Do password check !! @TODO
            for field in ['nickname', 'email']:
                if field in data and getattr(user, field) != data[field]:
                    setattr(user, field, data[field])
            user.save()
            return HttpResponse(f'User updated successfully.', status=200)
        except json.JSONDecodeError:
            return HttpResponseBadRequest('Invalid JSON data in the request body.') # 400
        except IntegrityError:
            return HttpResponseBadRequest(f'Nickname {user["nickname"]} is already in use.') # 400
        except Exception as e:
            return HttpResponseBadRequest('Unexpexted Error:', e) # 400

class Me(View):
    @token_validation
    def get(self, request: HttpRequest):
        try:
            user = get_user_obj(request)
        except PermissionDenied as e:
            return HttpResponse(str(e), status=401)
        except Http404 as e:
            return HttpResponse(str(e), status=404)
        won_matches = user.winner.all()
        lost_matches = user.loser.all()
        played_matches = MatchHistory.objects.filter(Q(winner=user) | Q(loser=user))

        avatar_data = get_avatar_data(user)
        user_data = {
            'nickname': user.nickname,
            'email': user.email,
            'avatar': avatar_data,
            'status': user.status,
            'admin': user.admin,
            'won_matches': [{'winner_score': match.winner_score, 'loser_score': match.loser_score, 'date_of_match': match.date_of_match} for match in won_matches],
            'lost_matches': [{'winner_score': match.winner_score, 'loser_score': match.loser_score, 'date_of_match': match.date_of_match} for match in lost_matches],
            'played_matches': [{'winner_score': match.winner_score, 'winner_username': match.winner.nickname, 'loser_score': match.loser_score, 'loser_username': match.loser.nickname , 'date_of_match': match.date_of_match} for match in played_matches],
        }
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

                avatar_dir = os.path.join(settings.MEDIA_ROOT, 'avatars')
                for item in os.listdir(avatar_dir):
                    if item.startswith(f"user_{user.id}"):
                        os.remove(os.path.join(avatar_dir, item))
                try:
                    user.avatar.save(new_file_name, file)
                except ValidationError as e:
                    return HttpResponseBadRequest(e)

                return HttpResponse(f'Avatar updated successfully.', status=200)
            else:
                return HttpResponseBadRequest('No avatar provided.') # 400
        except Exception as e:
            return HttpResponseBadRequest('Unexpexted Error:', e) # 400
