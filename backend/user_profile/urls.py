from django.urls import path
from user_profile.views import Users, Me

urlpatterns = [
    path('', Users.as_view(), name="users"),
    path('me/', Me.as_view(), name="me")
]
