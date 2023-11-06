from django.db import models


class User(models.Model):
    status_enum = [
        ("ONL", "Online"),
        ("OFF", "Offline"),
        ("ING", "Ingame"),
        ("BUS", "Busy"),
    ]
    nickname = models.CharField(max_length=50, unique=True)
    email = models.TextField()
    avatar = models.TextField()
    status = models.CharField(max_length=10, choices=status_enum, default="ONL")
    admin = models.BooleanField(default=False)
