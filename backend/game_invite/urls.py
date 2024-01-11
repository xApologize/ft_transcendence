from django.urls import path
from .views import gameInvite
# from friend_list.views import FriendHandling, GetPendingRequest

urlpatterns = [
    path('', gameInvite.as_view(), name="gameInvite")
    # path('', FriendHandling.as_view(), name="FriendSend"),
    # path('get/', GetPendingRequest.as_view(), name='FriendGet')
]
