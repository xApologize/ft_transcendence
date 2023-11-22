from django.conf import settings
import jwt
import time

def generate_jwt(lifespan: int, id: int) -> str:
    current_time: int = int(time.time())
    payload: dict[str, any] = {
        "iss": "pong99",
        "sub": id,
        "exp": current_time + lifespan,
        "iat": current_time
    }
    return jwt.encode(payload, settings.SECRET_KEY, algorithm="HS256")

def verify_token(jwt_token: str) -> str:
    try:
        decrypt_token: dict = jwt.decode(jwt_token, settings.SECRET_KEY, algorithms=["HS256"])
        return "Valid"
    except jwt.ExpiredSignatureError:
        return "Expired"
    except jwt.InvalidTokenError:
        return "Invalid"
