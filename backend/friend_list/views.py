from user_profile.models import User
from django.db.utils import IntegrityError
from django.http import JsonResponse, HttpResponseForbidden, HttpResponse, Http404, HttpResponseNotFound, HttpResponseBadRequest, HttpRequest
from django.views import View
from django.db.models import Q
from utils.decorators import token_validation
from django.core.exceptions import PermissionDenied
from utils.functions import get_user_obj
from .models import FriendList

# Need to check if the user that he's looking for exist ?
# Add timestamp to friend model to handle spam ?

class FriendChange(View):
    # Friend Request
    @token_validation
    def post(self, request: HttpRequest): 
        try:
            id_receiver = int(request.GET.get('id'))
            if not id_receiver:
                return HttpResponseBadRequest('No ID provided.')
        except (TypeError, ValueError):
            return HttpResponseBadRequest('Invalid ID provided.')

        try:
            sender = get_user_obj(request)
            receiver = User.objects.get(pk=id_receiver)
        except User.DoesNotExist:
            return HttpResponseNotFound('User not found.')
        except PermissionDenied as e:
            return HttpResponse(str(e), status=401)
        except Http404 as e:
            return HttpResponse(str(e), status=404)

        # Check if there's already a friend relationship or pending request between the two users
        existing_relationship = FriendList.objects.filter(
            (Q(friend1=sender, friend2=receiver) | Q(friend1=receiver, friend2=sender))
        ).first()

        if existing_relationship:
            if existing_relationship.status == "PENDING" and existing_relationship.friend2 == sender:
                existing_relationship.status = "ACCEPTED"
                existing_relationship.save()
                return JsonResponse({'message': 'Friend request accepted.'})
            elif existing_relationship.status == "PENDING":
                return JsonResponse({'message': 'Friend request already sent.'}, status=200)
            else:
                return JsonResponse({'message': 'Already friends or request pending.'}, status=200)

        # No existing relationship, create a new friend request
        try:
            FriendList.objects.create(friend1=sender, friend2=receiver, status="PENDING")
        except IntegrityError:
            return JsonResponse({'message': 'A request already exists.'}, status=400)
        return JsonResponse({'message': 'Friend request sent.'}, status=201)


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
    
        # Check if current user has sent a friend request to foreign user
        if FriendList.objects.filter(friend1=current_user, friend2=foreign_user, status="PENDING").exists():
            return JsonResponse({'state': 'SEND'})

        # Check if current user has received a friend request from foreign user
        if FriendList.objects.filter(friend1=foreign_user, friend2=current_user, status="PENDING").exists():
            return JsonResponse({'state': 'RECEIVE'})

        # Check if they are already friends
        if FriendList.objects.filter(
                (Q(friend1=current_user, friend2=foreign_user) | Q(friend1=foreign_user, friend2=current_user)),
                status="ACCEPTED").exists():
            return JsonResponse({'state': 'FRIEND'})

        # If none of the above, they are not related
        return JsonResponse({'state': 'NONE'})
    

    @token_validation
    def delete(self, request: HttpRequest):
        try:
            id_other_user = int(request.GET.get('id'))
            if not id_other_user:
                return HttpResponseBadRequest('No ID provided.')
        except (TypeError, ValueError):
            return HttpResponseBadRequest('Invalid ID provided.')

        try:
            current_user = get_user_obj(request)
            other_user = User.objects.get(pk=id_other_user)
        except User.DoesNotExist:
            return HttpResponseNotFound('User not found.')
        except PermissionDenied as e:
            return HttpResponse(str(e), status=401)

        # Check all friend relationships involving the current user and the other user
        existing_relationship = FriendList.objects.filter(
            (Q(friend1=current_user, friend2=other_user) | Q(friend1=other_user, friend2=current_user))
        ).first()

        if existing_relationship:
            if existing_relationship.status == "PENDING" and existing_relationship.friend2 == current_user:
                # Current user is refusing a received request
                existing_relationship.status = "REFUSED"
                existing_relationship.save()
                return JsonResponse({'message': 'Friend request refused.'})
            else:
                # Either canceling a sent request, unfriending, or deleting a refused request
                existing_relationship.delete()
                action = "unfriended" if existing_relationship.status == "ACCEPTED" else "canceled"
                return JsonResponse({'message': f'Friend request {action}.'})

        return JsonResponse({'message': 'No existing relationship or request to delete.'}, status=404)