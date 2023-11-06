from django.shortcuts import render
from django.http import HttpResponse, HttpRequest
from .models import User


def index(request: HttpRequest):
    return HttpResponse("This is a test!")

def bozo(request: HttpRequest):
    print(request.GET)
    if request.method == "GET":
        return HttpResponse("Hello! Get!")
    elif request.method == "POST":
         return HttpResponse("Hello! POST!")