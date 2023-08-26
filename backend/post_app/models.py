from django.db import models

# Create your models here.

class Post(models.Model):    #~test(1)
    title = models.CharField(max_length=100)
    content = models.TextField()
    image = models.ImageField(upload_to='post_images')

    def __str__(self):
        return self.title
