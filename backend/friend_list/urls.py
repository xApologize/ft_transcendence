from django.urls import path
from friend_list.views import FriendChange

urlpatterns = [
    path('', FriendChange.as_view(), name="FriendRequest"),
]
