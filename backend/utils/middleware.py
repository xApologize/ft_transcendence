from utils.functions import decrypt_user_id

class JwtSocketMiddleWare:
    def __init__(self, inner):
        self.inner = inner

    async def __call__(self, scope, receive, send):
        jwt_token: str = scope.get("query_string").decode("utf8")
        user_id: int = decrypt_user_id(jwt_token)
        if user_id < 0:
            print("INVALID TOKEN")
            await send({
                "type": "websocket.close",
                "code": 6969,
                "reason": "Invalid Token"
                })
            return
        print("VALID TOKEN")
        scope["user_id"] = user_id
        return self.inner(scope, receive, send)
