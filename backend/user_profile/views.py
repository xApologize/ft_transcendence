from django.shortcuts import render
from django.http import HttpResponse, HttpRequest, JsonResponse
from .models import User
from django.core import serializers


def index(request: HttpRequest):
    return HttpResponse("This is a test!")

def bozo(request: HttpRequest):
    print(request.get_full_path)
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
        except:
            return HttpResponse("Couldn't find the user")
    elif request.method == "POST":
         return HttpResponse("Hello! POST!")