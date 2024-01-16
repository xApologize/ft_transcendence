from django.urls import path
from .views import LobbyHandling

urlpatterns = [
    path('', LobbyHandling.as_view(), name="lobby"),
]
