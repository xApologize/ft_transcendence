from django.test import TestCase
from friend_list.models import FriendList
from user_profile.models import User
from django.db.utils import IntegrityError


# Create your tests here.
class UserTestCase(TestCase):
    def setUp(self):
        testFriend = User.objects.create(
            nickname="BozoCat",
            email="BozoCat@gmail.com",
            status="OFF",
            admin=False
        )
        testFriend2 = User.objects.create(
            nickname="BozoDog",
            email="BozoDog@gmail.com",
            status="OFF",
            admin=False
        )
        FriendList.objects.create(
            friend1=testFriend,
            friend2=testFriend2,
            status="ACCEPTED"
        )

    def test_self_friend(self):
        '''Check if constraints doesn't let you friend yourself'''
        user = FriendList.objects.get(friend1__nickname="BozoCat").friend1
        with self.assertRaises(IntegrityError):
            FriendList.objects.create(friend1=user, friend2=user, status="ACCEPTED")

    def test_integretity_friend_list(self):
        '''Check for integretity in the friend list'''
        with self.assertRaises(IntegrityError):
            FriendList.objects.create(
                friend1=FriendList.objects.get(friend1__nickname="BozoCat").friend1,
                friend2=FriendList.objects.get(friend2__nickname="BozoDog").friend2,
                status="ACCEPTED"
            )
