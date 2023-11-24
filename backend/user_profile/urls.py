from django.urls import path
from user_profile.views import Users, Login

urlpatterns = [
    path('', Users.as_view(), name="users"),
    path('login/', Login.as_view(), name="login")
]
