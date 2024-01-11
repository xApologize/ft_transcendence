from django.urls import path
from friend_list.views import FriendHandling, GetPendingRequest

urlpatterns = [
    path('', FriendHandling.as_view(), name="FriendSend"),
    path('get/', GetPendingRequest.as_view(), name='FriendGet')

]
