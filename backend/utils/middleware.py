from utils.functions import decrypt_user_id


class JwtSocketMiddleWare:
    def __init__(self, inner):
        self.inner = inner

    async def __call__(self, scope, receive, send):
        jwt_token: str = scope.get("query_string").decode("utf8")
        user_id: int = decrypt_user_id(jwt_token)
        scope["user_id"] = user_id
        return await self.inner(scope, receive, send)
