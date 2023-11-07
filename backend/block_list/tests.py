from django.test import TestCase
from block_list.models import BlockList
from user_profile.models import User


# Create your tests here.
class UserTestCase(TestCase):
    def setUp(self):
        blockerTest = User.objects.create(
            nickname="BozoCat",
            email="BozoCat@gmail.com",
            avatar="gekwghkrehkre",
            status="OFF",
            admin=False
        )
        blockedUserTest = User.objects.create(
            nickname="BozoDog",
            email="BozoDog@gmail.com",
            avatar="gekwghkrehkre",
            status="OFF",
            admin=False
        )
        BlockList.objects.create(
            blocker=blockerTest,
            blocked_user=blockedUserTest
        )

    def test_block_list(self):
        '''Normal check for blocked list'''
        self.assertEqual(BlockList.objects.get(blocker__nickname="BozoCat").blocker.nickname, "BozoCat")
        self.assertEqual(BlockList.objects.get(blocked_user__nickname="BozoDog").blocked_user.nickname, "BozoDog")
