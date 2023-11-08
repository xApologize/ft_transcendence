from django.test import TestCase
from friend_list.models import FriendList
from user_profile.models import User


# Create your tests here.
class UserTestCase(TestCase):
    def setUp(self):
        testFriend = User.objects.create(
            nickname="BozoCat",
            email="BozoCat@gmail.com",
            avatar="gekwghkrehkre",
            status="OFF",
            admin=False
        )
        testFriend2 = User.objects.create(
            nickname="BozoDog",
            email="BozoDog@gmail.com",
            avatar="gekwghkrehkre",
            status="OFF",
            admin=False
        )
        FriendList.objects.create(
            friend1=testFriend,
            friend2=testFriend2,
            status="ACCEPTED"
        )

    def test_block_list(self):
        '''Normal check for blocked list'''
        self.assertEqual(FriendList.objects.get(friend1__nickname="BozoCat").friend1.nickname, "BozoCat")
        self.assertEqual(FriendList.objects.get(friend2__nickname="BozoDog").friend2.nickname, "BozoDog")
        self.assertEqual(FriendList.objects.get(friend2__nickname="BozoDog").status, "ACCEPTED")
