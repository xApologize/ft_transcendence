from django.test import TestCase
from .models import User

# Create your tests here.
class UserTestCase(TestCase):
    def setUp(self):
        User.objects.create(
            nickname="Test",
            email="test@gmail.com",
            avatar="geropgjieriogjer",
            status="O",
            admin=False
        )

    def test_user(self):
        user = User.objects.get(nickname="Test")
        self.assertEqual(user.nickname, "Test")
        self.assertEqual(user.email, "test@gmail.com")
