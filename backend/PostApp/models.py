from django.db import models

# Create your models here.

# JSON File per Image to be sent to FrontEnd
class Post(models.Model):
    imageName = models.CharField(max_length=100, primary_key=True)
    imageLocation = models.ImageField(upload_to='images')
    words = models.TextField()    #~note I want this to be a List, and to have each word have a corresponding Coordinate List
    coordinates = models.JSONField(default=list)

    def __str__(self):
        return self.imageName
