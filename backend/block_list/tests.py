from django.test import TestCase
from block_list.models import BlockList
from user_profile.models import User
from django.db.utils import IntegrityError


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
        '''Normal check for block list'''
        self.assertEqual(BlockList.objects.get(
            blocker__nickname="BozoCat").blocker.nickname, "BozoCat")
        self.assertEqual(BlockList.objects.get(
            blocked_user__nickname="BozoDog").blocked_user.nickname, "BozoDog")

    def test_self_block(self):
        '''Check if cannot block yourself'''
        user = BlockList.objects.get(blocker__nickname="BozoCat").blocker
        with self.assertRaises(IntegrityError):
            BlockList.objects.create(blocker=user, blocked_user=user)

    def test_integretity_error(self):
        '''Check for integretity block list'''
        with self.assertRaises(IntegrityError):
            BlockList.objects.create(
                blocker=BlockList.objects.get(blocker__nickname="BozoCat").blocker,
                blocked_user=BlockList.objects.get(blocked_user__nickname="BozoDog").blocked_user
                )
