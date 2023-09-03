from django.db import models

# Create your models here.

# JSON File to be sent to FrontEnd
class Post(models.Model):
    title = models.CharField(max_length=100)
    content = models.TextField()
    image = models.ImageField(upload_to='images')
    coordinates = [(0,0)]

    def __str__(self):
        return self.title
