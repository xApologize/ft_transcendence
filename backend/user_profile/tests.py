from django.test import TestCase
from .models import User
from django.urls import reverse


# Create your tests here.
# class UserTestCase(TestCase):
#     def setUp(self):
#         User.objects.create(
#             nickname="TestUser",
#             email="TestUser@gmail.com",
#             avatar="geropgjieriogjer",
#             status="OFF",
#             admin=False
#         )
#         User.objects.create(
#             nickname="Clown",
#             email="aTest@gmail.com",
#             avatar="geirhiorejhre",
#             admin=True
#         )

#     def test_user(self):
#         '''Normal check for user that was added to the database'''
#         user = User.objects.get(nickname="TestUser")
#         self.assertEqual(user.nickname, "TestUser")
#         self.assertEqual(user.email, "TestUser@gmail.com")
#         self.assertEqual(user.status, "OFF")

#     def test_user_two(self):
#         '''Check if the default is really set to status O(offline)'''
#         user_two = User.objects.get(nickname="Clown")
#         self.assertEqual(user_two.nickname, "Clown")
#         self.assertEqual(user_two.status, "ONL")
#         self.assertEqual(user_two.admin, True)

# from django.test import TestCase
# from user_profile.models import User  # Import your User model

class UserTestCase(TestCase):
    def setUp(self):
        self.user1 = User.objects.create(
            nickname="TestUser",
            email="TestUser@gmail.com",
            avatar="geropgjieriogjer",
            status="OFF",
            admin=False
        )
        self.user2 = User.objects.create(
            nickname="Clown",
            email="aTest@gmail.com",
            avatar="geirhiorejhre",
            admin=True
        )

    def test_get_all_users(self):
        response = self.client.get(reverse('users'))
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, 'TestUser')
        self.assertContains(response, 'Clown')

    def test_create_user(self):
        data = {
            "nickname": "NewUser",
            "email": "newuser@example.com",
            "avatar": "new-avatar",
            "status": "ONL",
            "admin": False
        }
        initial_user_count = User.objects.count()
        response = self.client.post(reverse('users'), data, content_type='application/json')
        self.assertEqual(response.status_code, 201)
    
        self.assertEqual(User.objects.count(), initial_user_count + 1)
        new_user = User.objects.get(nickname="NewUser")
        self.assertEqual(new_user.email, "newuser@example.com")
        self.assertEqual(new_user.avatar, "new-avatar")
        self.assertEqual(new_user.status, "ONL")
        self.assertEqual(new_user.admin, False)


    def test_get_specific_user(self):
        response = self.client.get(reverse('specific_user', args=[self.user1.nickname]))
        self.assertEqual(response.status_code, 200)

        expected_user_data = {
            "nickname": "TestUser",
            "email": "TestUser@gmail.com",
            "avatar": "geropgjieriogjer",
            "status": "OFF",
            "admin": False
        }
        self.assertDictEqual(response.json()['user'], expected_user_data)

    def test_delete_specific_user(self):
        response = self.client.delete(reverse('specific_user', args=[self.user1.nickname]))
        self.assertEqual(response.status_code, 200)

        # Check if user1 was deleted from the database
        user1_exists = User.objects.filter(nickname="TestUser").exists()
        self.assertFalse(user1_exists)

    def test_patch_specific_user(self):
        data = {
            "email": "new-email@example.com",
            "status": "BUS"
        }

        response = self.client.patch(reverse('specific_user', args=[self.user1.nickname]), data, content_type='application/json')
        self.assertEqual(response.status_code, 200)

        # Check if user1's data was updated in the database
        user1_updated = User.objects.get(nickname="TestUser")
        self.assertEqual(user1_updated.email, "new-email@example.com")
        self.assertEqual(user1_updated.status, "BUS")

