from django.db import models

# Create your models here.
class Test(models.Model):
    title = models.CharField(max_length=200)
    abc = models.BooleanField(default=False)