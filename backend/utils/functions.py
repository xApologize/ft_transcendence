import jwt
import time
import secrets

def generate_jwt(lifespan: int, id: int) -> str:
    print("HI")
    secret: str = secrets.token_hex(256)
    current_time: int = int(time.time())
    payload: dict[str, any] = {
        "iss": "pong99",
        "sub": id,
        "exp": current_time + lifespan,
        "iat": current_time
    }
    return jwt.encode(payload, "bozo", algorithm="HS256")

def verify_token(jwt_token: str) -> str:
    try:
        decrypt_token: dict = jwt.decode(jwt_token, "bozo", algorithms=["HS256"]) # figure out what to do with secret
        return "Valid"
    except jwt.ExpiredSignatureError:
        return "Expired"
    except jwt.InvalidTokenError:
        return "Invalid"
