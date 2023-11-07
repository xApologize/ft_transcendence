from django.urls import path
from user_profile.views import Users, SpecificUser

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("bozo/", views.bozo, name="index"),
    path('<str:user_nickname>/', SpecificUser.as_view()),
    path('', Users.as_view()),
]

####
# 
# /api/users/, GET -> get all users | POST -> create a user. 
# /api/users/<str:user_nickname>/, GET -> get a specific user by it's nickname | DELETE -> delete specific user by it's nickname | [NOT WORKING] PATCH -> Update specific user by it's nickname.
# To update a user's information, use the PATCH request method. In the JSON payload, include only the fields that are changing.
# For example, to update the email and status, send a JSON containing:
# {
#   "email": "new-email@example.com",
#   "status": 1
# }
#
####
# /api/friends/<str:user_nickname>/, GET -> get all friends interaction of the specific users. Include accepted, refused and pending request | {POST?} -> would create a new friend request
# /api/friends/<str:user_nickname>/accepted, GET -> get all the accepted friends.
# /api/friends/<str:user_nickname>/accepted/online, GET -> get all the accepted online friends.
# /api/friends/<str:user_nickname>/accepted/offline, GET -> get all the accepted offline friends.
# /api/friends/<str:user_nickname>/accepted/ingame, GET -> get all the accepted ingame friends.
# /api/friends/<str:user_nickname>/accepted/busy, GET -> get all the accepted busy friends.
# /api/friends/<str:user_nickname>/refused, GET -> get all the refused request. (?)
# /api/friends/<str:user_nickname>/pending, GET -> get all the pending request.
