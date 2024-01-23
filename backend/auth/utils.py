from django.http import JsonResponse
from utils.functions import generate_2fa_token
from user_profile.models import User


def handle_2fa_login(user):
    response = JsonResponse({'2fa_required': True})
    temp_token = generate_2fa_token(user.id)
    response.set_cookie('2fa_token', temp_token, httponly=True, secure=True, max_age=300)
    return response
