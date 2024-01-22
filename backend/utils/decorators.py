from utils.functions import add_double_jwt, decrypt_user_id
from django.http import HttpRequest, HttpResponse, JsonResponse
from user_profile.models import User
from django.db.models import Q
from interactive.consumers import log_user
from asgiref.sync import async_to_sync

EXPIRED: int = -1


# def token_validation(func):
#     '''Decorator for jwt token verification, will execute the function if the
#         tokens are valid. Will send a 401 status if both tokens are expired,
#         not present or tempered with'''
#     def wrapper(self, request: HttpRequest):
#         jwt_access_token = request.headers.get("jwt-access")
#         if jwt_access_token is None:
#             decrypt_result: int = EXPIRED
#         else:
#             decrypt_result = decrypt_user_id(jwt_access_token)
#         if decrypt_result > 0:
#             return func(self, request)
#         elif decrypt_result == EXPIRED:
#             refresh_jwt_cookie = request.COOKIES.get("refresh_jwt")
#             if refresh_jwt_cookie is None:
#                 return HttpResponse("Couldn't locate cookie jwt", status=401)
#             decrypt_cookie_id: int = decrypt_user_id(refresh_jwt_cookie)
#             if decrypt_cookie_id > 0:
#                 response: HttpResponse = HttpResponse("Access Token Refresh", status=200)
#                 return add_double_jwt(response, decrypt_cookie_id)
#             else:
#                 return HttpResponse("Cookie Expired jwt", status=401)
#         return HttpResponse(
#             "https://i.ytimg.com/vi/KEkrWRHCDQU/maxresdefault.jpg", status=401)
#     return wrapper

def token_validation(func):
    '''Decorator for jwt token verification, will execute the function if the
        tokens are valid. Will send a 401 status if both tokens are expired,
        not present or tempered with'''
    def wrapper(self, request: HttpRequest):
        jwt_access_token = request.headers.get("jwt-access")
        refresh_jwt_cookie = request.COOKIES.get("refresh_jwt")
        if jwt_access_token is None:
            decrypt_result: int = EXPIRED
        else:
            decrypt_result = decrypt_user_id(jwt_access_token)
        if refresh_jwt_cookie is None:
            decrypt_cookie_id = EXPIRED
        else:
            decrypt_cookie_id = decrypt_user_id(refresh_jwt_cookie)
        if decrypt_cookie_id != decrypt_cookie_id:
            async_to_sync(log_user)(decrypt_cookie_id)
            return JsonResponse({"error": "You are log in another tab. Please logout first."}, status=401) # Bug double login same browser
        if decrypt_result > 0:
            return func(self, request)
        elif decrypt_result == EXPIRED:
            if refresh_jwt_cookie is None:
                return JsonResponse({"error": "Please login before accessing home page."}, status=401) # No permission to do this
            if decrypt_cookie_id > 0:
                response: HttpResponse = HttpResponse("Access Token Refresh", status=200) 
                return add_double_jwt(response, decrypt_cookie_id)
            else:
                return HttpResponse({"error": "Session Expired. Please login."}, status=401) # Kickout, cookie expired
        return JsonResponse({"error": 
            "https://i.ytimg.com/vi/KEkrWRHCDQU/maxresdefault.jpg"}, status=401)
    return wrapper

def verify_cookies(func):
    '''Check the cookies to prevent multiple login in the same browser if the cookies are present and valid'''
    def wrapper(self, request: HttpRequest):
        refresh_jwt_cookie = request.COOKIES.get("refresh_jwt")
        if refresh_jwt_cookie is None:
            return func(self, request) # No token present login
        decrypt_cookie_id: int = decrypt_user_id(refresh_jwt_cookie)
        if decrypt_cookie_id < 0:
            return func(self, request) # Cookie is out of date, or invalid, let the user login.
        try:
            if User.objects.filter(Q(pk=decrypt_cookie_id, status='ONL') | Q(pk=decrypt_cookie_id, status='ING')).exists():
                async_to_sync(log_user)(decrypt_cookie_id)
                return func(self, request)
        except Exception:
            return HttpResponse({"error": "Error checking the cookie"}, status=401)
        return func(self, request)
    return wrapper
