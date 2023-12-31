from django.db import models
from user_profile.models import User
from django.db.models import Q, F


# Create your models here.
class FriendList(models.Model):
    status_friend_list = [
        ("ACCEPTED"),
        ("PENDING"),
        ("REFUSED"),
        ("UNFRIEND"),
        ("CANCEL")
    ]
    friend1 = models.ForeignKey(User, on_delete=models.CASCADE, related_name="friend1")
    friend2 = models.ForeignKey(User, on_delete=models.CASCADE, related_name="friend2")
    last_action_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='last_action_user')
    status = models.CharField(max_length=10)
    timeLastUpdate = models.DateTimeField(auto_now=True)
    class Meta:
        verbose_name = "friend_list"
        verbose_name_plural = "friend_list"
        constraints = [
            models.UniqueConstraint(fields=["friend1", "friend2"], name="Unique rows friend_list"),
            models.CheckConstraint(check=~Q(friend1=F("friend2")), name="Cannot friend yourself")
        ]
