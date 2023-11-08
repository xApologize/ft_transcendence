from django.db import models
from user_profile.models import User


# Create your models here.
class FriendList(models.Model):
    status_friend_list = [
        ("ACCEPTED"),
        ("REFUSED"),
        ("PENDING"),
    ]
    friend1 = models.ForeignKey(User, on_delete=models.CASCADE, related_name="friend1")
    friend2 = models.ForeignKey(User, on_delete=models.CASCADE, related_name="friend2")
    status = models.CharField(max_length=10)
