from django.urls import path
from friend_list.views import FriendSend, FriendReceive

urlpatterns = [
    path('send/', FriendSend.as_view(), name="FriendSend"),
    path('receive/', FriendReceive.as_view(), name="FriendReceive"),

]
