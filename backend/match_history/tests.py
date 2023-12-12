from django.test import TestCase
from match_history.models import MatchHistory
from user_profile.models import User
from django.db.utils import IntegrityError


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
        MatchHistory.objects.create(
            winner_score=5,
            loser_score=2,
            winner=user,
            loser=user2
        )

    def test_match_history(self):
        '''Normal check for match history'''
        self.assertEqual(MatchHistory.objects.get(pk=1).winner_score, 5)
        self.assertEqual(MatchHistory.objects.get(pk=1).loser_score, 2)
        self.assertEqual(MatchHistory.objects.get(pk=1).winner.nickname, "BozoCat")
        self.assertEqual(MatchHistory.objects.get(pk=1).loser.nickname, "BozoDog")

    def test_uniqueness(self):
        '''Check for uniquess in match history user'''
        user = MatchHistory.objects.get(winner__nickname="BozoCat").winner
        with self.assertRaises(IntegrityError):
            MatchHistory.objects.create(
                winner_score=51,
                loser_score=22,
                winner=user,
                loser=user
                )
