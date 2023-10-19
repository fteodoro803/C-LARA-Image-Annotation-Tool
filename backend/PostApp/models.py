from django.db import models

class Word(models.Model):
    word = models.CharField(max_length=100)
    coordinates = models.JSONField(default=list)
    speakerControl = models.JSONField(default=list)
    translationControl = models.JSONField(default=list)

    def __str__(self):
        return self.word

class Post(models.Model):
    imageName = models.CharField(max_length=100, primary_key=True)
    imageLocation = models.ImageField(upload_to='images')
    words = models.ManyToManyField(Word)

    def __str__(self):
        return self.imageName

# hello there 