# Generated by Django 4.1.13 on 2023-12-18 14:27

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('block_list', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='blocklist',
            name='blocked_user',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='blocked_user', to=settings.AUTH_USER_MODEL),
        ),
        migrations.AddField(
            model_name='blocklist',
            name='blocker',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='blocker', to=settings.AUTH_USER_MODEL),
        ),
        migrations.AddConstraint(
            model_name='blocklist',
            constraint=models.UniqueConstraint(fields=('blocker', 'blocked_user'), name='Unique rows block list'),
        ),
        migrations.AddConstraint(
            model_name='blocklist',
            constraint=models.CheckConstraint(check=models.Q(('blocker', models.F('blocked_user')), _negated=True), name='You cannot block yourself'),
        ),
    ]
