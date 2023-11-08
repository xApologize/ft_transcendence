from .models import User
from django.db.utils import IntegrityError
from django.http import JsonResponse, HttpResponseForbidden, HttpResponse, Http404, HttpResponseNotFound, HttpResponseBadRequest, HttpRequest
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from django.views import View
import json


@method_decorator(csrf_exempt, name='dispatch') #- to apply to every function in the class.
class Users(View):
    # Get All Users or specific users
    def get(self, request: HttpRequest):
        nicknames = request.GET.getlist('nickname')

        if nicknames:
            users = User.objects.filter(nickname__in=nicknames)
        else:
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

        if user_data:
            return JsonResponse({'users': user_data})
        return HttpResponseNotFound('User not found')


    # Create a user
    # Check quoi a été passer en param?
    def post(self, request: HttpResponse):
        try:
            user_data = json.loads(request.body)
            required_fields = ['nickname', 'email', 'avatar', 'status', 'admin']

            extra_fields = user_data.keys() - required_fields
            if extra_fields:
                return JsonResponse({'error': f'Unexpected fields: {", ".join(extra_fields)}'}, status=400)
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
                    return JsonResponse({'error': 'Missing one or more required fields in JSON'}, status=400)
            except IntegrityError:
                    return JsonResponse({'error': f'User {user_data["nickname"]} already exists'}, status=400)
        except json.JSONDecodeError:
            return JsonResponse({'error': 'Invalid JSON data in the request body'}, status=400)
        return JsonResponse({'message': f'User {user_data["nickname"]} created successfully'}, status=201)


    # Delete a specific users
    def delete(self, request: HttpRequest):
        nickname = request.GET.get('nickname')
        if not nickname:
            return HttpResponseBadRequest('No nickname provided for deletion.')

        user = User.objects.filter(nickname=nickname).first()
        if not user:
            return HttpResponseNotFound(f'No user found with the nickname: {nickname}')

        user.delete()
        return HttpResponse(f'User with nickname {nickname} deleted successfully.', status=204)


    # update specific user
    def patch(self, request: HttpRequest):
        nickname = request.GET.get('nickname')
        if not nickname:
            return HttpResponseBadRequest('No nickname provided for update.')

        user = User.objects.filter(nickname=nickname).first()
        if not user:
            return HttpResponseNotFound(f'No user found with the nickname: {nickname}')

        try:

            user_data = json.loads(request.body)
            for field in ['nickname', 'email', 'avatar', 'status', 'admin']:
                if field in user_data:
                    setattr(user, field, user_data[field])
            user.save()
        except json.JSONDecodeError:
            return HttpResponseBadRequest('Invalid JSON data in the request body.')
        except IntegrityError:
            return HttpResponseBadRequest(f'Nickname {user_data["nickname"]} is already in use.')

        return HttpResponse(f'User with nickname {nickname} updated successfully.')
