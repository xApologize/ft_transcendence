from django.db import models
from user_profile.models import User

class MatchInvite(models.Model):
    user_inviting = models.ForeignKey(User, related_name='invites_sent', on_delete=models.CASCADE)
    recipient = models.ForeignKey(User, related_name='invites_received', on_delete=models.CASCADE)
    time_stamp = models.TimeField(auto_now=True)
    pending = models.BooleanField()