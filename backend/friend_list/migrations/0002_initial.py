# Generated by Django 4.1.13 on 2023-12-24 17:15

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('friend_list', '0001_initial'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.AddField(
            model_name='friendlist',
            name='friend1',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='friend1', to=settings.AUTH_USER_MODEL),
        ),
        migrations.AddField(
            model_name='friendlist',
            name='friend2',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='friend2', to=settings.AUTH_USER_MODEL),
        ),
        migrations.AddField(
            model_name='friendlist',
            name='last_action_by',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='last_action_user', to=settings.AUTH_USER_MODEL),
        ),
        migrations.AddConstraint(
            model_name='friendlist',
            constraint=models.UniqueConstraint(fields=('friend1', 'friend2'), name='Unique rows friend_list'),
        ),
        migrations.AddConstraint(
            model_name='friendlist',
            constraint=models.CheckConstraint(check=models.Q(('friend1', models.F('friend2')), _negated=True), name='Cannot friend yourself'),
        ),
    ]
