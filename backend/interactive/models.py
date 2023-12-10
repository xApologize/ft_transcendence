from django.db import models


class LookingForMatch(models.Model):
    paddleA = models.IntegerField()
    paddleB = models.IntegerField(default=-1)
