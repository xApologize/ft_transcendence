import os

from channels.auth import AuthMiddlewareStack
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.security.websocket import AllowedHostsOriginValidator
from django.core.asgi import get_asgi_application
from utils.middleware import JwtSocketMiddleWare
from pong.routing import websocket_pong_patterns
from interactive.routing import websocket_interactive

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'src.settings')
django_asgi_app = get_asgi_application()

application = ProtocolTypeRouter(
    {
        "http": django_asgi_app,
        "websocket": AllowedHostsOriginValidator(
            JwtSocketMiddleWare(
                URLRouter(websocket_pong_patterns + websocket_interactive)
             )
        ),
    }
)
