from django.http import HttpResponse, HttpRequest, JsonResponse
from .models import User


def index(request: HttpRequest):
    return HttpResponse("This is a test!")


def bozo(request: HttpRequest):
    print(request)
    if request.method == "GET":
        try:
            user = User.objects.get(pk=1)
            user_data = {
                'id': user.id,
                'nickname': user.nickname,
                'email': user.email,
                'avatar': user.avatar,
                'status': user.status,
                'admin': user.admin,
            }
            return JsonResponse(user_data)
        except Exception:
            return HttpResponse("Couldn't find the user")
    elif request.method == "POST":
        return HttpResponse("Hello! POST!")


import json
from django.http import JsonResponse, HttpResponseForbidden, HttpResponse, Http404, HttpResponseNotFound, HttpResponseBadRequest
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from django.views import View

# temp
users = [
            {
                'userID': 1,
                'nickname': 'User1Nickname',
                'email': 'user1@example.com',
                'avatar': 'user1_avatar.jpg',
                'token': 'user1_token',
                'status': 0,
                'admin': False
            },
            {
                'userID': 2,
                'nickname': 'User2Nickname',
                'email': 'user2@example.com',
                'avatar': 'user2_avatar.jpg',
                'token': 'user2_token',
                'status': 0,
                'admin': False
            },
            {
                'userID': 3,
                'nickname': 'User3Nickname',
                'email': 'user3@example.com',
                'avatar': 'user3_avatar.jpg',
                'token': 'user3_token',
                'status': 0,
                'admin': False
            },
            {
                'userID': 4,
                'nickname': 'User4Nickname',
                'email': 'user4@example.com',
                'avatar': 'user4_avatar.jpg',
                'token': 'user4_token',
                'status': 0,
                'admin': False
            },
]


@method_decorator(csrf_exempt, name='dispatch') #- to apply to every function in the class.
class Users(View):
    # Check if at least 1 user exist.
    # Get All Users
    def get(self, request: HttpResponse):
        return JsonResponse({'users': users})


    # Create a user
    def post(self, request:HttpResponse):
        try:
            # check si le user_data a plus de champ que nécessaire.
            user_data = json.loads(request.body)
            required_fields = ['userID', 'nickname', 'email', 'avatar', 'token', 'status', 'admin']
            if all(field in user_data for field in required_fields):
                users.append(user_data)
                return HttpResponse(f'User {user_data["nickname"]} created successfully')
            else:
                return HttpResponseBadRequest('Missing one or more required fields')
        except json.JSONDecodeError:
            return HttpResponseBadRequest('Invalid JSON data in the request body')


@method_decorator(csrf_exempt, name='dispatch') #- to apply to every function in the class.
class SpecificUser(View):
    # Get specific user.
    def get(self, request: HttpResponse, user_nickname: str):
        user = [u for u in users if u['nickname'] == user_nickname] 
        if user:
            return JsonResponse({'user': user})
        return HttpResponseNotFound(f'User {user_nickname} not found')


    # Delete specific user.
    def delete(self, request: HttpResponse, user_nickname: str):
        user = [u for u in users if u['nickname'] == user_nickname]
        if user:
            users.remove(user[0])
            return HttpResponse(f'User {user_nickname} deleted successfully')
        return HttpResponseNotFound(f'User {user_nickname} not found')


    # Update specific user
    def patch(self, request: HttpResponse, user_nickname: str):
        return HttpResponse('Not setup')
