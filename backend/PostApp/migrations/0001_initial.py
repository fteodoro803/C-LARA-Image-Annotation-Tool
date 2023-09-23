# Generated by Django 4.2.4 on 2023-09-23 04:26

from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Word',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('word', models.CharField(max_length=100)),
                ('coordinates', models.JSONField(default=list)),
            ],
        ),
        migrations.CreateModel(
            name='Post',
            fields=[
                ('imageName', models.CharField(max_length=100, primary_key=True, serialize=False)),
                ('imageLocation', models.ImageField(upload_to='images')),
                ('words', models.ManyToManyField(to='PostApp.word')),
            ],
        ),
    ]
