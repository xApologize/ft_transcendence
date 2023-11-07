from django.urls import path
from user_profile.views import Users, SpecificUser

urlpatterns = [
    path('<str:user_nickname>/', SpecificUser.as_view(), name="specific_user"),
    path('', Users.as_view(), name="users"),
]
