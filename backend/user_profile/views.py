from .models import User
from django.db.utils import IntegrityError
from django.http import JsonResponse, HttpResponseForbidden, HttpResponse, Http404, HttpResponseNotFound, HttpResponseBadRequest
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from django.views import View
import json


@method_decorator(csrf_exempt, name='dispatch') #- to apply to every function in the class.
class Users(View):
    # Get All Users
    def get(self, request: HttpResponse):
        users = User.objects.all()
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

        response_data = {'users': user_data}
        return JsonResponse(response_data)


    # Create a user
    def post(self, request: HttpResponse):
        try:
            user_data = json.loads(request.body)
            required_fields = ['nickname', 'email', 'avatar', 'status', 'admin']

            extra_fields = user_data.keys() - required_fields
            if extra_fields:
                return HttpResponseBadRequest(f'Can\'t use POST: Unexpected fields: {", ".join(extra_fields)}')
            try:
                if all(field in user_data for field in required_fields):
                    user = User.objects.create(
                        nickname=user_data['nickname'],
                        email=user_data['email'],
                        avatar=user_data['avatar'],
                        status=user_data['status'],
                        admin=user_data['admin']
                    )
                    user.save()
                else:
                    return HttpResponseBadRequest('Can\'t use POST: Missing one or more required fields in JSON')
            except IntegrityError:
                return HttpResponseBadRequest(f'Nickname {user_data["nickname"]} is already in use.')
        except json.JSONDecodeError:
            return HttpResponseBadRequest('Can\'t use POST: Invalid JSON data in the request body')
        return JsonResponse({'message': f'User {user_data["nickname"]} created successfully'}, status=201)



@method_decorator(csrf_exempt, name='dispatch') #- to apply to every function in the class.
class SpecificUser(View):
    # Get specific user.
    def get(self, request: HttpResponse, user_nickname: str):
        try:
            user = User.objects.get(nickname=user_nickname)
            user_data = {
                'nickname': user.nickname,
                'email': user.email,
                'avatar': user.avatar,
                'status': user.status,
                'admin': user.admin,
            }
            return JsonResponse({'user': user_data})
        except User.DoesNotExist:
            return HttpResponseNotFound(f'Can\'t use GET: User {user_nickname} not found')


    # Delete specific user.
    def delete(self, request: HttpResponse, user_nickname: str):
        try:
            user = User.objects.get(nickname=user_nickname)
            user.delete()
            return HttpResponse(f'User {user_nickname} deleted successfully')
        except User.DoesNotExist:
            return HttpResponseNotFound(f'Can\'t use DELETE: User {user_nickname} not found')


    # Update specific user
    def patch(self, request: HttpResponse, user_nickname: str):
        try:
            user = User.objects.get(nickname=user_nickname)

            try:
                user_data = json.loads(request.body)
            except json.JSONDecodeError:
                return HttpResponseBadRequest('Can\'t use PATCH: Invalid JSON data in the request body')

            # Autoriser plusieurs changements en une seule requête ? Sécuritaire?
            for field in ['nickname', 'email', 'avatar', 'status', 'admin']:
                if field in user_data:
                    setattr(user, field, user_data[field])
            user.save()

            user_data = {
                'nickname': user.nickname,
                'email': user.email,
                'avatar': user.avatar,
                'status': user.status,
                'admin': user.admin,
            }
            return JsonResponse({'user': user_data})

        except User.DoesNotExist:
            return HttpResponseNotFound(f'Can\'t use PATCH: User {user_nickname} not found')
