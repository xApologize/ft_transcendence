from django.conf import settings
from django.http import HttpResponse, HttpRequest, Http404
from user_profile.models import User
from django.shortcuts import get_object_or_404
import jwt, re, time
from django.core.exceptions import PermissionDenied


def generate_jwt(lifespan: int, id: int) -> str:
    '''Function that will generate a jwt token with the id and secret'''
    current_time: int = int(time.time())
    payload: dict[str, any] = {
        "iss": "pong99",
        "sub": id,
        "exp": current_time + lifespan,
        "iat": current_time
    }
    return jwt.encode(payload, settings.SECRET_KEY, algorithm="HS256")


def first_token(response: HttpResponse, id: int) -> HttpResponse:
    '''Adds an element to the header to signal to the frontend that it is the first token,
       preventing the frontend to fetch twice.
    '''
    response["new"] = "True"
    return add_double_jwt(response, id)


def add_double_jwt(response: HttpResponse, id: int) -> HttpResponse:
    '''Create access and refresh token and add them to the http response'''
    REFRESH_DURATION: int = 7200
    ACCESS_DURATION: int = 30

    access_token = generate_jwt(ACCESS_DURATION, id)
    refresh_token = generate_jwt(REFRESH_DURATION, id)
    response.set_cookie(
        key="refresh_jwt", value=refresh_token, secure=True, httponly=True, samesite="None")
    response["jwt"] = access_token
    return response


def decrypt_user_id(jwt_token: str) -> int:
    '''Decrypt the user id and send it back, if any error happen send
    a negative integer'''
    EXPIRED: int = -1
    INVALID: int = -2
    try:
        decrypt_token: dict = jwt.decode(
            jwt_token, settings.SECRET_KEY, algorithms=["HS256"])
        return decrypt_token.get("sub")
    except jwt.ExpiredSignatureError:
        return EXPIRED
    except jwt.InvalidTokenError:
        return INVALID


def get_user_obj(request: HttpRequest) -> User:
    access_jwt_cookie = request.headers.get("jwt-access")
    if access_jwt_cookie is None:
        raise PermissionDenied("Couldn't locate access jwt")
    decrypt_result = decrypt_user_id(access_jwt_cookie)
    if decrypt_result <= 0:
        raise Http404("User not found")
    user = get_object_or_404(User, id=decrypt_result)
    return user


def generate_2fa_token(id: int) -> str:
    '''Function that will generate a jwt token with the id and secret'''
    current_time: int = int(time.time())
    lifespan: int = 300
    payload: dict[str, any] = {
        "iss": "pong99",
        "sub": id,
        "exp": current_time + lifespan,
        "iat": current_time
    }
    return jwt.encode(payload, settings.SECRET_KEY, algorithm="HS256")

def checkInputUser(userInput, fieldSupposeToHave):
    for field in fieldSupposeToHave:
        if field not in userInput:
            return False
    return True

 
def checkEmail(email):
    regex = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,7}\b'
    if(re.fullmatch(regex, email)):
        return True
    else:
        return False