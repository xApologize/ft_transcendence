from django.db import models
from django.core.exceptions import ValidationError
from PIL import Image
import imghdr, os

def validate_image(image):

    # Check for actual image format
    image_format = imghdr.what(image.file)
    if not image_format:
        raise ValidationError("Invalid image format.")

    # Check file extension
    valid_extensions = ['.jpg', '.jpeg', '.png']
    extension = os.path.splitext(image.name)[1]
    if extension.lower() not in valid_extensions:
        raise ValidationError(f"Unsupported file extension. Allowed extensions: {', '.join(valid_extensions)}")

    file_size = image.file.size
    max_size = 5 * (1024 * 1024)  # 5MB
    if file_size > max_size:
        raise ValidationError("Maximum file size exceeded. Limit is 5MB.")

    im = Image.open(image)
    width, height = im.size
    max_width = 1920
    max_height = 1080
    if width > max_width or height > max_height:
        raise ValidationError(f"Image dimensions should not exceed {max_width}x{max_height}px.")


class User(models.Model):
    status_enum = [
        ("ONL", "Online"),
        ("OFF", "Offline"),
        ("ING", "Ingame"),
        ("BUS", "Busy"),
    ]
    nickname = models.CharField(max_length=50, unique=True)
    email = models.TextField()
    avatar = models.ImageField(null=True, blank=True, upload_to="avatars/")
    status = models.CharField(max_length=10, choices=status_enum, default="OFF")
    admin = models.BooleanField(default=False)
    password = models.CharField(max_length=50, default="abc")
    def save(self, *args, **kwargs):
        if self.avatar:
            validate_image(self.avatar)
        super(User, self).save(*args, **kwargs)
