from user_profile.models import User
from django.http import JsonResponse, HttpResponseForbidden, HttpResponse, Http404, HttpResponseNotFound, HttpResponseBadRequest, HttpRequest
from django.views import View
from django.db.models import Q
from utils.decorators import token_validation
from django.core.exceptions import PermissionDenied
from utils.functions import get_user_obj
from .models import FriendList
from .utils import changeState, handle_add_friend, handle_accept_friend
import json
from user_profile.utils import get_avatar_data

# !!! DOIT HANDLE FRIEND REQUESTS A SOIT MÊME

# Envoyer friend request, Cancel ou supprimer.
class FriendHandling(View):
    # Friend Request
    @token_validation
    def post(self, request: HttpRequest): 
        try:
            id_receiver = int(request.GET.get('id'))
            action = request.GET.get('action')

            if not id_receiver or not action:
                return HttpResponseBadRequest('ID or action not provided.')

            sender = get_user_obj(request)
            receiver = User.objects.get(pk=id_receiver)
        except (TypeError, ValueError, json.JSONDecodeError):
            return HttpResponseBadRequest('Invalid request data.')
        except User.DoesNotExist:
            return HttpResponseNotFound('User not found.')
        except PermissionDenied as e:
            return HttpResponse(str(e), status=401)

        if sender == receiver:
            return JsonResponse({'message': 'You cannot send a friend request to yourself.'}, status=400)

        # Handling different actions
        if action == 'add':
            # Handle adding a friend
            return handle_add_friend(sender, receiver)
        elif action == 'accept':
            # Handle accepting a friend request
            return handle_accept_friend(sender, receiver)
        else:
            return JsonResponse({'message': 'Unknown action.'}, status=400)


    @token_validation
    def get(self, request: HttpRequest):
        try:
            foreign_ID = int(request.GET.get('id'))
            if not foreign_ID:
                return HttpResponseBadRequest('No ID provided.')
        except (TypeError, ValueError):
            return HttpResponseBadRequest('Invalid ID provided.')
        try:
            current_user = get_user_obj(request)
            foreign_user = User.objects.get(pk=foreign_ID)
        except User.DoesNotExist:
            return HttpResponseNotFound('User not found.')
        except PermissionDenied as e:
            return HttpResponse(str(e), status=401)
        except Http404 as e:
            return HttpResponse(str(e), status=404)
    
        existing_relationship = FriendList.objects.filter(
            Q(friend1=current_user, friend2=foreign_user) | Q(friend1=foreign_user, friend2=current_user)
        ).first()

        if existing_relationship:
            if existing_relationship.status == "PENDING":
                if existing_relationship.friend1 == current_user:
                    return JsonResponse({'state': 'sentRequest'})
                else:
                    return JsonResponse({'state': 'receivedRequest'})
            elif existing_relationship.status == "ACCEPTED":
                return JsonResponse({'state': 'friend'})

        # If none of the above, they are not related
        return JsonResponse({'state': 'none'})
    

    @token_validation
    def delete(self, request: HttpRequest):
        try:
            id_other_user = int(request.GET.get('id'))
            action = request.GET.get('action')

            if not id_other_user or not action:
                return HttpResponseBadRequest('ID or action not provided.')

            current_user = get_user_obj(request)
            other_user = User.objects.get(pk=id_other_user)

        except (TypeError, ValueError, json.JSONDecodeError):
            return HttpResponseBadRequest('Invalid request data.')
        except User.DoesNotExist:
            return HttpResponseNotFound('User not found.')
        except PermissionDenied as e:
            return HttpResponse(str(e), status=401)

        existing_relationship = FriendList.objects.filter(
            (Q(friend1=current_user, friend2=other_user) | Q(friend1=other_user, friend2=current_user))
        ).first()

        if not existing_relationship:
            return JsonResponse({
                'message': f'No existing relationship with {other_user.nickname}.',
                'status': 'none'
            }, status=404)

        if action == 'cancel' and existing_relationship.status == "PENDING" and existing_relationship.friend1 == current_user:
            changeState(existing_relationship, "CANCEL", current_user)
            return JsonResponse({
                'message': f'Friend request to {other_user.nickname} canceled successfully.',
                'status': 'cancel'
            }, status=200)
        elif action == 'refuse' and existing_relationship.status == "PENDING" and existing_relationship.friend2 == current_user:
            changeState(existing_relationship, "REFUSED", current_user)
            return JsonResponse({
                'message': f'Friend request from {other_user.nickname} refused.',
                'status': 'refuse'
            }, status=200)
        elif action == 'unfriend' and existing_relationship.status == "ACCEPTED":
            changeState(existing_relationship, "UNFRIEND", current_user)
            return JsonResponse({
                'message': f'{other_user.nickname} removed successfully from your friends.',
                'status': 'none'
            }, status=200)
        else:
            status = 'none'
            if existing_relationship.status != "PENDING" and action in ['cancel', 'refuse']:
                status = 'friend' if existing_relationship.status == "ACCEPTED" else "none"
                error_detail = f"Friend request to {other_user.nickname} has already been answered. Can't cancel." if existing_relationship.status == "ACCEPTED" else f"No pending request with {other_user.nickname}."
            elif existing_relationship.status != "ACCEPTED" and action == 'unfriend':
                error_detail = f"You are not friends with {other_user.nickname}."
            elif action not in ['cancel', 'refuse', 'unfriend']:
                error_detail = f"Unknown action: '{action}'."
            else:
                error_detail = "Error. Please try again."
            return JsonResponse({
                "message": error_detail,
                'status': status
            }, status=403)

class FriendGetAll(View):
    @token_validation
    def get(self, request: HttpRequest):
        try:
            user = get_user_obj(request)
        except User.DoesNotExist:
            return HttpResponseNotFound('User not found.')
        except PermissionDenied as e:
            return HttpResponse(str(e), status=401)

        pending_friends = FriendList.objects.filter(
            Q(friend1=user) | Q(friend2=user),
            status="PENDING"
        )

        friend_requests = []
        for relation in pending_friends:
            friend = relation.friend1 if relation.friend1 != user else relation.friend2
            avatar = get_avatar_data(friend)
            friend_info = {
                "id": friend.id,
                "nickname": friend.nickname,
                "avatar": avatar,
                "role": "receiver" if relation.friend1 == user else "sender"
            }
            friend_requests.append(friend_info)

        return JsonResponse({"friend_requests": friend_requests})