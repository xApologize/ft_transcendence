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

    def test_block_list(self):
        '''Normal check for blocked list'''
        self.assertEqual(TournamentHistory.objects.get(pk=1).winner.nickname, "BozoCat")
        self.assertEqual(TournamentHistory.objects.get(pk=1).loser.nickname, "BozoDog")
        self.assertEqual(TournamentHistory.objects.get(pk=1).winner_score, 42)
        self.assertEqual(TournamentHistory.objects.get(pk=1).loser_score, 22)
        self.assertEqual(TournamentHistory.objects.get(pk=1).tournament_ID, 1)
        self.assertEqual(TournamentHistory.objects.get(pk=1).match_position, 444)
