from django.db import models


class LookingForMatch(models.Model):
    paddleA = models.IntegerField()
    mailbox_a = models.TextField()
    paddleB = models.IntegerField(default=-1)


class LookingForMatchClassic(models.Model):
    paddleA = models.IntegerField()
    mailbox_a = models.TextField()
    paddleB = models.IntegerField(default=-1)
