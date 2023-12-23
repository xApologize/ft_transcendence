from django.test import TestCase
from tournament_history.models import TournamentHistory
from user_profile.models import User


# Create your tests here.
class UserTestCase(TestCase):
    def setUp(self):
        user = User.objects.create(
            nickname="BozoCat",
            email="BozoCat@gmail.com",
            status="OFF",
            admin=False
        )
        user2 = User.objects.create(
            nickname="BozoDog",
            email="BozoDog@gmail.com",
            status="OFF",
            admin=False
        )
        TournamentHistory.objects.create(
            winner=user,
            loser=user2,
            winner_score=42,
            loser_score=22,
            tournament_ID=1,
            match_position=444
        )
