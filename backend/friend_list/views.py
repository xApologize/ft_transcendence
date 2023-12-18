from user_profile.models import User
from django.db.utils import IntegrityError
from django.http import JsonResponse, HttpResponseForbidden, HttpResponse, Http404, HttpResponseNotFound, HttpResponseBadRequest, HttpRequest
from django.views import View
from django.db.models import Q
from utils.decorators import token_validation
from django.core.exceptions import PermissionDenied
from utils.functions import get_user_obj
from .models import FriendList
from django.utils import timezone
from datetime import timedelta

# Need to check if the user that he's looking for exist ?
# Add timestamp to friend model to handle spam ?


# Envoyer friend request, Cancel ou supprimer.
class FriendSend(View):
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
            Q(friend1=sender, friend2=receiver) | Q(friend1=receiver, friend2=sender)
        ).order_by('-timeLastUpdate').first()

        if existing_relationship:
            status = existing_relationship.status
            print(status)
            if status == "CANCEL" or status == "REFUSED" or status == "UNFRIEND":
                response = handleDelete(existing_relationship, sender, receiver)
                if response:
                    return response
            elif status == "PENDING" and existing_relationship.friend2 == sender: # Current user is accepting a received request
                changeState(existing_relationship, "ACCEPTED", sender)
                return JsonResponse({'message': 'Friend request accepted.'})
            elif status == "PENDING" and existing_relationship.friend1 == sender: # Current user is sending a request to someone who already sent one
                return JsonResponse({'message': 'Friend request already sent.'}, status=429)
            elif status == "ACCEPTED": # Current user is sending a request to someone he's already friends with
                return JsonResponse({'message': 'Already friends.'}, status=200)
            else:
                return JsonResponse({'message': 'No existing status for relationship.'}, status=404)
        else:
            print("Create friend relation")
        # No existing relationship, create a new friend request
        try:
            FriendList.objects.create(friend1=sender, friend2=receiver, status="PENDING", last_action_by=sender)
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
    
        print(FriendList.objects.filter(friend1=current_user, friend2=foreign_user, status="PENDING").exists())

        # Check if current user has sent a friend request to foreign user
        if FriendList.objects.filter(friend1=current_user, friend2=foreign_user, status="PENDING").exists():
            return JsonResponse({'state': 'SENT'})

        # Check if current user has received a friend request from foreign user
        if FriendList.objects.filter(friend1=foreign_user, friend2=current_user, status="PENDING").exists():
            return JsonResponse({'state': 'RECEIVED'})

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

        # Efficient query with first() directly in filter
        existing_relationship = FriendList.objects.filter(
            (Q(friend1=current_user, friend2=other_user) | Q(friend1=other_user, friend2=current_user))
        ).first()

        if not existing_relationship:
            return JsonResponse({'message': 'No existing relationship.'}, status=404)

        new_status = ""
        if existing_relationship.status == "PENDING":
            new_status = "REFUSED" if existing_relationship.friend2 == current_user else "CANCEL"
        elif existing_relationship.status == "ACCEPTED":
            new_status = "UNFRIEND"

        if new_status:
            changeState(existing_relationship, new_status, current_user)
            return JsonResponse({'message': f'{new_status.title()} action completed.'})

        return JsonResponse({'message': 'Action not permitted.'}, status=403)

    
def changeState(relationShip, state, user):
    relationShip.status = state
    relationShip.last_action_by = user
    relationShip.save()
    
def handleDelete(relationShip: FriendList, sender: User, receiver: User):
    status = relationShip.status
    if status == "CANCEL" and relationShip.last_action_by == sender:
        time_diff = timezone.now() - relationShip.timeLastUpdate
        if time_diff < timedelta(seconds=30):
            wait_time = timedelta(seconds=30) - time_diff
            remaining_seconds = int(wait_time.total_seconds())
            return JsonResponse({'message': f'Action blocked to prevent spamming. Please wait {remaining_seconds} seconds.'}, status=429)
    
    relationShip.delete()
    return None

class FriendReceive(View):
    # Accept friend request
    @token_validation
    def post(self, request: HttpRequest):
        return HttpResponse("POST")
    
    # Refuse friend request
    def delete(self, request: HttpRequest):
        return HttpResponse("DELETE")