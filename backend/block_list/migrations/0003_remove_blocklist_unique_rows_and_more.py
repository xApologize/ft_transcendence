# Generated by Django 4.2.6 on 2023-11-12 23:59

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('block_list', '0002_alter_blocklist_options_and_more'),
    ]

    operations = [
        migrations.RemoveConstraint(
            model_name='blocklist',
            name='unique_rows',
        ),
        migrations.RemoveConstraint(
            model_name='blocklist',
            name='cannot_block_yourself',
        ),
        migrations.AddConstraint(
            model_name='blocklist',
            constraint=models.UniqueConstraint(fields=('blocker', 'blocked_user'), name='unique_rows_block_list'),
        ),
        migrations.AddConstraint(
            model_name='blocklist',
            constraint=models.CheckConstraint(check=models.Q(('blocker', models.F('blocked_user')), _negated=True), name='You cannot block yourself'),
        ),
    ]