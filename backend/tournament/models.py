from django.db import models
from user_profile.models import User
from django.db.models.signals import pre_save
from django.dispatch import receiver


class Tournament(models.Model):
    # Constants to represent the different states of the tournament
    WAITING_FOR_PLAYERS = 'waiting'
    FULL = 'full'
    STARTED = 'started'
    FINISH = 'finish'

    # Choices tuple
    STATUS_CHOICES = [
        (WAITING_FOR_PLAYERS, 'Waiting for players'),
        (FULL, 'Full'),
        (STARTED, 'Started'),
        (FINISH, 'Finish'),
    ]

    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='owned_tournaments')
    players = models.ManyToManyField(User, related_name='tournamentPlayer')
    last_update_time = models.DateTimeField()
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default=WAITING_FOR_PLAYERS)
