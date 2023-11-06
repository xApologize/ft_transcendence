from django.db import models


class User(models.Model):
    status_enum = [
        ("O", "Online"),
        ("OF", "Offline"),
        ("I", "Ingame"),
        ("B", "Busy"),
    ]
    nickname = models.CharField(max_length=50)
    email = models.TextField()
    avatar = models.TextField()
    status = models.CharField(max_length=10, choices=status_enum, default="O")
    admin = models.BooleanField(default=False)
