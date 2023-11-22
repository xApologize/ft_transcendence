from utils.functions import generate_jwt, add_double_jwt, decrypt_user_id
from django.http import HttpRequest, HttpResponse

EXPIRED: int = -1

def token_validation(func):
    def wrapper(self, request: HttpRequest):
        jwt_access_token = request.headers.get("jwt-access")
        if jwt_access_token:
            print("Token exist")
        else:
            print("Token doesn't exist")
        decrypt_result = decrypt_user_id(jwt_access_token)
        if decrypt_result > 0:
            print("VALID TOKEN")
            return func(self, request)
        elif decrypt_result == EXPIRED:
            print("EXPIRED TOKEN")
            refresh_jwt_cookie = request.COOKIES.get("refresh_jwt")
            if refresh_jwt_cookie == None:
                return HttpResponse("Couldn't locate cookie jwt", status=401)
            decrypt_cookie_id: int = decrypt_user_id(refresh_jwt_cookie)
            if decrypt_cookie_id > 0:
                return add_double_jwt(func(self, request), decrypt_cookie_id)
        return HttpResponse("https://i.ytimg.com/vi/KEkrWRHCDQU/maxresdefault.jpg", status=401)
    return wrapper
