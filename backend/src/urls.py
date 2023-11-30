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
    path('api/user/', include('user_profile.urls')),
    path('api/friend/', include('friend_list.urls')),
    path('api/login/', include('auth.urls')),
    path("chat/", include("chat.urls")),
    path('api/auth/', include('auth.urls')),
]

####
# [NOTE FOR FRONTEND]
#
# - All requests should be structured with a trailing slash '/' before param. For example, '/api/user/?nickname=Dave' is correct,
# but '/api/user?nickname=Dave' without the trailing slash will result in an internal error when using the PATCH, POST, or DELETE methods.
#
# - When using the PATCH request method to update an information in the db, include only the fields that are changing in the JSON payload.
# For example, to update the email and status of a user with nickname "nickname1", you would need to PATCH at the "/api/user/?nickname=Dave" URL and send a JSON payload like this:
# {
#   "email": "new-email@example.com",
#   "status": "new-status"
# }
#
####
# [USER]
#
# /api/user/, GET -> get all users | POST -> create a user. 
# /api/user/?nickname=dave, GET -> get a specific user by it's nickname | DELETE -> delete specific user by it's nickname | PATCH -> Update specific user by it's nickname.
#
####
# [FRIENDLIST]
#
# /api/friends/, Nothing wil work. Need at least nickname as parameter.
# /api/friends/?nickname=Dave, GET -> will return all friends relation Dave has.
# /api/friends/?nickname=Dave&status=ACCEPTED, GET -> will return all friend dave is friend with. Status can be ACCEPTED, PENDING or REFUSED.
#
####