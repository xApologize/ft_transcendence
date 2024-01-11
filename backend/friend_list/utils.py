from datetime import timedelta
from django.utils import timezone
from .models import FriendList
from django.http import JsonResponse, HttpResponseForbidden, HttpResponse, Http404, HttpResponseNotFound, HttpResponseBadRequest, HttpRequest
from django.db.utils import IntegrityError
from django.db.models import Q


def check_spamming(existing_relationship, current_user):
    if existing_relationship:
        time_diff = timezone.now() - existing_relationship.timeLastUpdate
        if time_diff < timedelta(seconds=30) and existing_relationship.last_action_by == current_user:
            wait_time = timedelta(seconds=30) - time_diff
            remaining_seconds = int(wait_time.total_seconds())
            return JsonResponse({'message': f'Action blocked to prevent spamming. Please wait {remaining_seconds} seconds.'}, status=429)
        existing_relationship.delete()
        
    return None

def handle_add_friend(sender, receiver):
    existing_relationship = FriendList.objects.filter(
        Q(friend1=sender, friend2=receiver) | Q(friend1=receiver, friend2=sender)
    ).first()

    if existing_relationship:
        if existing_relationship.status == "PENDING" and existing_relationship.friend1 == sender:
            return JsonResponse({
                'message': f'Friend request already sent to {receiver.nickname}.',
                'status': 'sentRequest'
            }, status=400)
        elif existing_relationship.status == "PENDING" and existing_relationship.friend2 == sender:
            return handle_accept_friend(sender, receiver)
        elif existing_relationship.status == "ACCEPTED":
            return JsonResponse({
                'message': f'You are already friends with {receiver.nickname}.',
                'status': 'friend'
            }, status=400)

    spam_check = check_spamming(existing_relationship, sender)
    if spam_check:
        return spam_check

    try:
        FriendList.objects.create(friend1=sender, friend2=receiver, status="PENDING", last_action_by=sender)
        return JsonResponse({
            'message': f'Friend request sent to {receiver.nickname}.',
            'status': 'sentRequest'
        }, status=201)
    except IntegrityError:
        return JsonResponse({'message': 'Error creating friend request.'}, status=400)


def handle_accept_friend(sender, receiver):
    existing_relationship = FriendList.objects.filter(
        friend1=receiver, friend2=sender, status="PENDING"
    ).first()

    spam_check = check_spamming(existing_relationship, sender)
    if spam_check:
        return spam_check

    if not existing_relationship:
        return JsonResponse({
            'message': f'No pending friend request from {sender.nickname} found.',
            'status': 'none'
        }, status=404)

    changeState(existing_relationship, "ACCEPTED", sender)
    return JsonResponse({
        'message': f'You are now friends with {receiver.nickname}.',
        'status': 'friend'
    }, status=200)

def changeState(relationShip, state, user):
    relationShip.status = state
    relationShip.last_action_by = user
    relationShip.save()