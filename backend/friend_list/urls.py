from django.urls import path
from friend_list.views import FriendHandling

urlpatterns = [
    path('', FriendHandling.as_view(), name="FriendSend"),

]
