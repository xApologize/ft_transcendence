from django.urls import path
from user_profile.views import Users, Me, Friends, Upload

urlpatterns = [
    path('', Users.as_view(), name="users"),
    path('upload/', Upload.as_view(), name="upload"),
    path('me/', Me.as_view(), name="me"),
    path('friends/', Friends.as_view(), name="friends"),
]
