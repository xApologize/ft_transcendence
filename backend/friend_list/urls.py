from django.urls import path
from friend_list.views import FriendList

urlpatterns = [
    path('', FriendList.as_view(), name="friendlist"),
]
