# Generated by Django 4.2.6 on 2023-11-07 01:22

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('tournament_history', '0002_alter_tournamenthistory_time_of_match'),
    ]

    operations = [
        migrations.AlterField(
            model_name='tournamenthistory',
            name='time_of_match',
            field=models.TimeField(),
        ),
    ]
