from django.urls import path, include
from auth.views import Login, Logout, Token, Create2FA

urlpatterns = [
    path('login/', Login.as_view(), name="login"),
    path('logout/', Logout.as_view(), name="logout"),
    path('token/', Token.as_view(), name="Token"),
    path('2fa/', Create2FA.as_view(), name="2fa"),

]
