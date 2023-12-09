from django.urls import path

from interactive import consumers

websocket_interactive = [
    path("ws/pong/interactive", consumers.UserInteractiveSocket.as_asgi()),
]
