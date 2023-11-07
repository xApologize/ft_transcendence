from django.urls import path
from user_profile.views import Users, SpecificUser

urlpatterns = [
    # path("", views.index, name="index"),
    path('<str:user_nickname>/', SpecificUser.as_view()),
    path('', Users.as_view()),
]
