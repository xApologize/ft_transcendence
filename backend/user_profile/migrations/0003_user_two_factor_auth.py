# Generated by Django 4.1.13 on 2023-12-14 03:30

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('user_profile', '0002_alter_user_avatar'),
    ]

    operations = [
        migrations.AddField(
            model_name='user',
            name='two_factor_auth',
            field=models.BooleanField(default=False),
        ),
    ]