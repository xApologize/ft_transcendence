"""
URL configuration for src project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('api/admin/', admin.site.urls),
    path("api/user/", include("user_profile.urls")),
]

####
# [NOTE FOR FRONTEND]
#
# - All requests should be structured with a trailing slash '/'. For example, '/api/users/<str:user_nickname>/' is correct,
# but '/api/user/<str:user_nickname>' without the trailing slash will result in an internal error when using the PATCH, POST, or DELETE methods.
#
# - When using the PATCH request method to update an information in the db, include only the fields that are changing in the JSON payload.
# For example, to update the email and status of a user with nickname "nickname1", you would need to PATCH at the "/api/user/nickname1/" URL and send a JSON payload like this:
# {
#   "email": "new-email@example.com",
#   "status": "new-status"
# }
#
####
# [USER]
#
# /api/users/, GET -> get all users | POST -> create a user. 
# /api/users/<str:user_nickname>/, GET -> get a specific user by it's nickname | DELETE -> delete specific user by it's nickname | PATCH -> Update specific user by it's nickname.
#
#### [NOT SETUP] What's under is only a draft and not implemented. [NOT SETUP]
# [Friendlist]
#
# /api/friends/<str:user_nickname>/, GET -> get all friends interaction of the specific users. Include accepted, refused and pending request | {POST?} -> would create a new friend request
# /api/friends/<str:user_nickname>/accepted, GET -> get all the accepted friends.
# /api/friends/<str:user_nickname>/accepted/online, GET -> get all the accepted online friends.
# /api/friends/<str:user_nickname>/accepted/offline, GET -> get all the accepted offline friends.
# /api/friends/<str:user_nickname>/accepted/ingame, GET -> get all the accepted ingame friends.
# /api/friends/<str:user_nickname>/accepted/busy, GET -> get all the accepted busy friends.
# /api/friends/<str:user_nickname>/refused, GET -> get all the refused request. (?)
# /api/friends/<str:user_nickname>/pending, GET -> get all the pending request.
#
####