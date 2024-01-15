from django.db import models

# Create your models here.
class Lobby(models.Model):
    owner = models.IntegerField()
    player_2 = models.IntegerField(default=-1)
    player_3 = models.IntegerField(default=-1)
    player_4 = models.IntegerField(default=-1)
    open = models.BooleanField(default=True)
