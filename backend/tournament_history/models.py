from django.db import models
from user_profile.models import User


# Create your models here.
class TournamentHistory(models.Model):
    winner = models.ForeignKey(User, on_delete=models.CASCADE, related_name="winnerTournament")
    loser = models.ForeignKey(User, on_delete=models.CASCADE, related_name="loserTournament")
    winner_score = models.IntegerField()
    loser_score = models.IntegerField()
    tournament_ID = models.IntegerField()
    match_position = models.IntegerField()
    time_of_match = models.TimeField(auto_now=True)
