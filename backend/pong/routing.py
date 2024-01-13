from django.urls import path

from pong import consumers

websocket_pong_patterns = [
    path("wss/pong/<match_id>/<paddle_side>", consumers.PongRoom.as_asgi()),
]
