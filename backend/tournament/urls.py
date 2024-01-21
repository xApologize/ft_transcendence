from django.urls import path
from .views import GetAllLobbies, GetMyLobby, GetPlayerNbrInSpecificLobby

urlpatterns = [
    path('', GetAllLobbies.as_view(), name="getAllLobbies"),
    path('specific/', GetMyLobby.as_view(), name='getmylobby'),
    path('players/', GetPlayerNbrInSpecificLobby.as_view(), name='GetPlayerNbrInSpecificLobby')
]
