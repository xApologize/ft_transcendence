from django.urls import path, include
from auth.views import Login

urlpatterns = [
    path('', Login.as_view(), name="connect"),
]
