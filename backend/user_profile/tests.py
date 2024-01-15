from django.test import TestCase
from .models import User
from django.urls import reverse


class UserTestCase(TestCase):
    def setUp(self):
        self.user1 = User.objects.create(
            nickname="TestUser",
            email="TestUser@gmail.com",
            status="OFF",
            admin=False
        )
        self.user2 = User.objects.create(
            nickname="Clown",
            email="aTest@gmail.com",
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
        self.assertEqual(user_two.status, "OFF")
        self.assertEqual(user_two.admin, True)

    def test_create_user(self):
        """
            Test to check if user creation is working.
        """
        data = {
            "nickname": "NewUser",
            "email": "newuser@example.com",
            "password": "abc",
            "passwordConfirm": "abc"
        }
        initial_user_count = User.objects.count()
        response = self.client.post(reverse('users'), data, content_type='application/json')
        self.assertEqual(response.status_code, 201)

        self.assertEqual(User.objects.count(), initial_user_count + 1)
        new_user = User.objects.get(nickname="NewUser")
        self.assertEqual(new_user.email, "newuser@example.com")
        self.assertEqual(new_user.status, "OFF")
        self.assertEqual(new_user.admin, False)

    def test_delete_specific_user(self):
        """
            Test to check whether deleting a user works.
        """
        response = self.client.delete(f"{reverse('users')}?nickname=TestUser")
        self.assertEqual(response.status_code, 204)

        user1_exists = User.objects.filter(nickname="TestUser").exists()
        self.assertFalse(user1_exists)
