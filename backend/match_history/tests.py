from django.test import TestCase
from match_history.models import MatchHistory
from user_profile.models import User


# Create your tests here.
class UserTestCase(TestCase):
    def setUp(self):
        user = User.objects.create(
            nickname="BozoCat",
            email="BozoCat@gmail.com",
            avatar="gekwghkrehkre",
            status="OFF",
            admin=False
        )
        user2 = User.objects.create(
            nickname="BozoDog",
            email="BozoDog@gmail.com",
            avatar="gekwghkrehkre",
            status="OFF",
            admin=False
        )
        MatchHistory.objects.create(
            winner_score=5,
            loser_score=2,
            winner=user,
            loser=user2
        )

    def test_block_list(self):
        '''Normal check for blocked list'''
        self.assertEqual(MatchHistory.objects.get(pk=1).winner_score, 5)
        self.assertEqual(MatchHistory.objects.get(pk=1).loser_score, 2)
        self.assertEqual(MatchHistory.objects.get(pk=1).winner.nickname, "BozoCat")
        self.assertEqual(MatchHistory.objects.get(pk=1).loser.nickname, "BozoDog")
