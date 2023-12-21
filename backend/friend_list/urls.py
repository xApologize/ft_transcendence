from django.urls import path
from friend_list.views import FriendHandling, FriendGetAll

urlpatterns = [
    path('', FriendHandling.as_view(), name="FriendSend"),
    path('get/', FriendGetAll.as_view(), name='FriendGetAll')

]
