from django.urls import path

from pong import consumers

websocket_pong_patterns = [
    path("ws/pong/UserA", consumers.PongUserA.as_asgi()),
    path("ws/pong/UserB", consumers.PongUserB.as_asgi()),
    path("ws/pong/<match_id>", consumers.PongCustomRoon.as_asgi()),
]