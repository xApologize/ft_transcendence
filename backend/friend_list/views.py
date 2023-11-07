from django.shortcuts import render
from .models import FriendList
from django.db.utils import IntegrityError
from django.http import JsonResponse, HttpResponseForbidden, HttpResponse, Http404, HttpResponseNotFound, HttpResponseBadRequest
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from django.views import View
from django.db.models import Q  # Import the Q object
import json
from django.core import serializers

# Create your views here.
# Not working
class Friendlist(View):
    def get(self, request):
        user_nickname = request.GET.get('nickname')
        user_status = request.GET.get('status')
        friend_relations = []
        status_friend_list = ("ACCEPTED", "REFUSED", "PENDING")

        if not user_nickname:
            return HttpResponseBadRequest('No nickname provided for friendlist.')

        friend_relations = FriendList.objects.filter(
            Q(friend1__nickname=user_nickname) | Q(friend2__nickname=user_nickname)
        )
        if user_status and user_status in status_friend_list:
            friend_relations = friend_relations.filter(status=user_status)
        elif user_status and user_status not in status_friend_list:
            return HttpResponseBadRequest('Status provided is not recognized.')

        friend_data = [
            {
                "friend1": friend.friend1.nickname,
                "friend2": friend.friend2.nickname,
                "status": friend.status,
            }
            for friend in friend_relations
        ]

        return JsonResponse({"friends": friend_data})
