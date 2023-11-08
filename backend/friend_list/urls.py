from django.urls import path
from friend_list.views import FriendListView

urlpatterns = [
    path('', FriendListView.as_view(), name="friendlist"),
]
