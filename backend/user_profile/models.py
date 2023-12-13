from django.db import models
from django.core.exceptions import ValidationError

class User(models.Model):
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
