from .models import User
from django.db.utils import IntegrityError
from django.http import JsonResponse, HttpResponseForbidden, HttpResponse, Http404, HttpResponseNotFound, HttpResponseBadRequest, HttpRequest
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from django.views import View
from utils.decorators import token_validation
import json
import re


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
            required_fields = ['nickname', 'email', 'avatar', 'status', 'admin']
            extra_fields = user_data.keys() - required_fields
            if extra_fields:
                error_message = f'Unexpected fields: {", ".join(extra_fields)}'
                return HttpResponseBadRequest(error_message) # 400
            try:
                # not empty
                if any(user_data.get(field, '') == '' for field in ['nickname', 'email', 'avatar']):
                    return HttpResponseBadRequest('Missing one or more required fields') # 400
                # does not contain space
                if any(' ' in user_data.get(field, '') for field in ['nickname', 'email', 'avatar']):
                    return HttpResponseBadRequest('Field contain space') 
                print(f"'{user_data['nickname']}'")
                print(f"'{user_data['email']}'")
                user = User.objects.create(
                    nickname=user_data['nickname'],
                    email=user_data['email'],
                    avatar=user_data['avatar'],
                    status=user_data['status'],
                    admin=user_data['admin']
                )
                user.save()
            except IntegrityError:
                return HttpResponseBadRequest(f'User {user_data["nickname"]} already exists') # 400    
        except json.JSONDecodeError:
            return HttpResponseBadRequest('Invalid JSON data in the request body') # 400
        return HttpResponse(f'User {user_data["nickname"]} created successfully', status=201)


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

                # if all(
                #     field in user_data and
                #     user_data[field] and
                #     not any(c.isspace() for c in user_data[field])
                #     for field in required_fields
                # ):