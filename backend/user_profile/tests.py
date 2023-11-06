from django.test import TestCase
from .models import User


# Create your tests here.
class UserTestCase(TestCase):
    def setUp(self):
        User.objects.create(
            nickname="TestUser",
            email="TestUser@gmail.com",
            avatar="geropgjieriogjer",
            status="OFF",
            admin=False
        )
        User.objects.create(
            nickname="Clown",
            email="aTest@gmail.com",
            avatar="geirhiorejhre",
            admin=True
        )

    def test_user(self):
        '''Normal check for user that was added to the database'''
        user = User.objects.get(nickname="TestUser")
        self.assertEqual(user.nickname, "TestUser")
        self.assertEqual(user.email, "TestUser@gmail.com")
        self.assertEqual(user.status, "OFF")

    def test_user_two(self):
        '''Check if the default is really set to status O(offline)'''
        user_two = User.objects.get(nickname="Clown")
        self.assertEqual(user_two.nickname, "Clown")
        self.assertEqual(user_two.status, "ONL")
        self.assertEqual(user_two.admin, True)
