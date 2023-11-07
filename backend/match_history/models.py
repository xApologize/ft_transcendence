from django.db import models
from user_profile.models import User

# Create your models here.
class MatchHistory(models.Model):
    winner_score = models.IntegerField()
    loser_score = models.IntegerField()
    date_of_match = models.TimeField(auto_now=True)
    winner = models.ForeignKey(User, on_delete=models.CASCADE, related_name="winner")
    loser = models.ForeignKey(User, on_delete=models.CASCADE, related_name="loser")
