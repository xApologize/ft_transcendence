from django.urls import path, include
from auth.views import Login, Logout, Token

urlpatterns = [
    path('login/', Login.as_view(), name="login"),
    path('logout/', Logout.as_view(), name="logout"),
    path('token/', Token.as_view(), name="Token"),

]
