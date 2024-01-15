from django.db import models
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin


class User(AbstractBaseUser, PermissionsMixin):
    status_enum = [
        ("ONL", "Online"),
        ("OFF", "Offline"),
        ("ING", "Ingame"),
        ("BUS", "Busy"),
    ]
    ACCOUNT_CREATION_METHODS = [
        ('signup', 'Signup Page'),
        ('intra', 'Intra Login'),
    ]
    account_creation_method = models.CharField(
        max_length=10, choices=ACCOUNT_CREATION_METHODS, default='signup')
    intra_id = models.IntegerField(null=True, blank=True, default=None)

    nickname = models.CharField(max_length=50, unique=True)
    email = models.TextField()
    avatar = models.ImageField(null=True, blank=True, upload_to="avatars/")
    status = models.CharField(max_length=10, choices=status_enum, default="OFF")
    admin = models.BooleanField(default=False)
    password = models.CharField(max_length=128, default="abc")
    two_factor_auth = models.BooleanField(default=False)

    USERNAME_FIELD = 'nickname'
    REQUIRED_FIELDS = ['password']
