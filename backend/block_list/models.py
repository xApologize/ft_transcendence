from django.db import models
from user_profile.models import User
from django.db.models import Q, F


# Create your models here.
class BlockList(models.Model):
    blocker = models.ForeignKey(User, on_delete=models.CASCADE, related_name="blocker")
    blocked_user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="blocked_user")

    class Meta:
        verbose_name = "block_list"
        verbose_name_plural = "block_list"
        constraints = [
            models.UniqueConstraint(
                fields=["blocker", "blocked_user"], name="Unique rows block list"
                ),
            models.CheckConstraint(
                check=~Q(blocker=F("blocked_user")), name="You cannot block yourself")
        ]
