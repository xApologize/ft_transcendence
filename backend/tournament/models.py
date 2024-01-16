from django.db import models

# Create your models here.
class Lobby(models.Model):
    owner = models.IntegerField(unique=True)
    player_2 = models.IntegerField(default=-1)
    player_3 = models.IntegerField(default=-1)
    player_4 = models.IntegerField(default=-1)
    open = models.BooleanField(default=True)

class Tournament(models.Model):
    player_1 = models.IntegerField(default=-1)
    player_2 = models.IntegerField(default=-1)
    player_3 = models.IntegerField(default=-1)
    player_4 = models.IntegerField(default=-1)
