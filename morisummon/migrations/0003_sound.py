# Generated by Django 5.1.4 on 2025-02-08 16:31

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('morisummon', '0002_alter_exchangesession_status'),
    ]

    operations = [
        migrations.CreateModel(
            name='Sound',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=100)),
                ('is_bgm', models.BooleanField(default=False)),
                ('file', models.FileField(upload_to='sounds/')),
            ],
        ),
    ]
