# Generated by Django 4.2.11 on 2024-06-04 07:30

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('gantt', '0002_alter_task_options_remove_task_dependencies_and_more'),
    ]

    operations = [
        migrations.AlterField(
            model_name='task',
            name='color',
            field=models.CharField(max_length=9),
        ),
    ]
