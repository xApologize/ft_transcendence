from user_profile.models import User
from friend_list.models import FriendList
from .models import MatchInvite
from django.http import JsonResponse, HttpResponseForbidden, HttpResponse, Http404, HttpResponseNotFound, HttpResponseBadRequest, HttpRequest
from django.views import View
from django.db.models import Q
from utils.decorators import token_validation
from django.core.exceptions import PermissionDenied
from utils.functions import get_user_obj
from user_profile.utils import get_avatar_data
import json

class gameInvite(View):
    @token_validation
    def post(self, request):
        try:
            data = json.loads(request.body)
            recipient_id = int(data['recipient'])
            user_inviting = get_user_obj(request)
            recipient = User.objects.filter(pk=recipient_id).first()  # Simplified retrieval with .first()

            if not recipient:
                raise Http404
            if user_inviting == recipient:
                raise PermissionDenied
            elif not FriendList.objects.filter(Q(friend1=user_inviting, friend2=recipient, status="ACCEPTED") | Q(friend1=recipient, friend2=user_inviting, status="ACCEPTED")).exists():
                return JsonResponse({"error": "You are not friends"}, status=403)
            elif MatchInvite.objects.filter(user_inviting=user_inviting, recipient=recipient, pending=True).exists():
                return JsonResponse({"error": "Invite already sent"}, status=400)
            elif MatchInvite.objects.filter(user_inviting=recipient, recipient=user_inviting, pending=True).exists():
                MatchInvite.objects.filter(user_inviting=recipient, recipient=user_inviting, pending=True).update(pending=False)
                return JsonResponse({"rType": "accept game"})
            else:
                MatchInvite.objects.create(user_inviting=user_inviting, recipient=recipient, pending=True)  # Updated to use objects instead of PKs
                return JsonResponse({"rType": "invite game"})
        except (KeyError, json.JSONDecodeError):
            return JsonResponse({"error": "Invalid data"}, status=400)
        except PermissionDenied:
            return JsonResponse({"error": "You cannot invite yourself"}, status=403)
        except Http404:
            return JsonResponse({"error": "User not found"}, status=404)
        except Exception as e:
            return JsonResponse({"error": f"Something went wrong: {e}"}, status=500)

    @token_validation
    def delete(self, request):
        try:
            data = json.loads(request.body)
            recipient_id = int(data['recipient'])
            user_inviting = get_user_obj(request)
            recipient = User.objects.filter(pk=recipient_id).first()  # Simplified retrieval with .first()

            if not recipient:
                raise Http404
            if user_inviting == recipient:
                raise PermissionDenied
            elif not FriendList.objects.filter(Q(friend1=user_inviting, friend2=recipient, status="ACCEPTED") | Q(friend1=recipient, friend2=user_inviting, status="ACCEPTED")).exists():
                return JsonResponse({"error": "You are not friends"}, status=403)
            elif not MatchInvite.objects.filter(user_inviting=user_inviting, recipient=recipient, pending=True).exists():
                return JsonResponse({"error": "Invite not found"}, status=404)
            else:
                MatchInvite.objects.filter(user_inviting=user_inviting, recipient=recipient, pending=True).delete()
                return JsonResponse({"rType": "cancel invite"})
        except (KeyError, json.JSONDecodeError):
            return JsonResponse({"error": "Invalid data"}, status=400)
        except PermissionDenied:
            return JsonResponse({"error": "You cannot cancel your own invite"}, status=403)
        except Http404:
            return JsonResponse({"error": "User not found"}, status=404)
        except Exception as e:
            return JsonResponse({"error": f"Something went wrong: {e}"}, status=500)

    @token_validation
    def get(self, request):
        try:
            user_receiving = get_user_obj(request)
            invites = MatchInvite.objects.filter(recipient=user_receiving, pending=True)
            
            invites_list = []
            for invite in invites:
                user_inviting = invite.user_inviting
                avatar_url = get_avatar_data(user_inviting)
                invites_list.append({
                    "id": user_inviting.pk, 
                    "nickname": user_inviting.nickname, 
                    "avatar": avatar_url,
                })
            
            return JsonResponse({"invites": invites_list})
        except Exception as e:
            return JsonResponse({"error": f"Something went wrong: {e}"}, status=500)