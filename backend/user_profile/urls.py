from django.urls import path
from user_profile.views import Users

urlpatterns = [
    path('', Users.as_view(), name="users"),
]
