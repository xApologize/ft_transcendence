from django.urls import path
from friend_list.views import Friendlist

urlpatterns = [
    path('', Friendlist.as_view(), name="friendlist"),
]
