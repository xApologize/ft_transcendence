from django.db import models
from user_profile.models import User
from django.db.models import Q, F


# Create your models here.
class MatchHistory(models.Model):
    winner_score = models.IntegerField()
    loser_score = models.IntegerField()
    date_of_match = models.DateTimeField(auto_now=True)
    winner = models.ForeignKey(User, on_delete=models.CASCADE, related_name="winner")
    loser = models.ForeignKey(User, on_delete=models.CASCADE, related_name="loser")

    class Meta:
        verbose_name = "match_history"
        verbose_name_plural = "match_history's"
        constraints = [
            models.CheckConstraint(
                check=~Q(winner=F("loser")), name="Winner and loser are the same user")
        ]
