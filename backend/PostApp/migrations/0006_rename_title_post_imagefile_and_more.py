# Generated by Django 4.2.4 on 2023-09-23 01:57

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('PostApp', '0005_rename_image_post_image_location_remove_post_id_and_more'),
    ]

    operations = [
        migrations.RenameField(
            model_name='post',
            old_name='title',
            new_name='imageFile',
        ),
        migrations.RenameField(
            model_name='post',
            old_name='image_location',
            new_name='imageLocation',
        ),
    ]
