from django.urls import path, include
from auth.views import Login, Logout, Token, Create2FA, Confirm2FA, Login2FA

urlpatterns = [
    path('login/', Login.as_view(), name="login"),
    path('logout/', Logout.as_view(), name="logout"),
    path('token/', Token.as_view(), name="Token"),
    path('2fa/', Create2FA.as_view(), name="2fa"),
    path('confirm2fa/', Confirm2FA.as_view(), name="confirm2fa"),
    path('login2fa/', Login2FA.as_view(), name="login2fa")
]
