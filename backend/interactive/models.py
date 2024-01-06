from django.db import models


class LookingForMatch(models.Model):
    paddleA = models.IntegerField()
    mailbox_a = models.TextField()
    paddleB = models.IntegerField(default=-1)

class MatchInvite(models.Model):
    user_inviting = models.IntegerField()
    recipient = models.IntegerField()
    time_stamp = models.TimeField(auto_now=True)
    pending = models.BooleanField()
