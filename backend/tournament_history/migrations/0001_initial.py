# Generated by Django 4.1.13 on 2023-12-18 14:27

from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='TournamentHistory',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('winner_score', models.IntegerField()),
                ('loser_score', models.IntegerField()),
                ('tournament_ID', models.IntegerField()),
                ('match_position', models.IntegerField()),
                ('time_of_match', models.TimeField(auto_now=True)),
            ],
        ),
    ]
