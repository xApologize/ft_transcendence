from django.db import models
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin

class User(AbstractBaseUser, PermissionsMixin):
    status_enum = [
        ("ONL", "Online"),
        ("OFF", "Offline"),
        ("ING", "Ingame"),
        ("BUS", "Busy"),
    ]
    nickname = models.CharField(max_length=50, unique=True)
    email = models.TextField()
    avatar = models.ImageField(null=True, blank=True, upload_to="avatars/")
    status = models.CharField(max_length=10, choices=status_enum, default="OFF")
    admin = models.BooleanField(default=False)
    password = models.CharField(max_length=50, default="abc")
    two_factor_auth = models.BooleanField(default=False)

    USERNAME_FIELD = 'nickname' 
    REQUIRED_FIELDS = ['password']
