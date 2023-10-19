from django.db import models

# class Word(models.Model):   # delete this later
#     word = models.CharField(max_length=100)
#     coordinates = models.JSONField(default=list)
#     speakerControl = models.JSONField(default=list)
#     translationControl = models.JSONField(default=list)
#
#     def __str__(self):
#         return self.word


class Post(models.Model):   # delete this later
    imageName = models.CharField(max_length=100, primary_key=True)
    imageLocation = models.ImageField(upload_to='images')
    # words = models.ManyToManyField(Word)

    def __str__(self):
        return self.imageName


class Coordinate(models.Model):
    xValue = models.IntegerField()
    yValue = models.IntegerField()


class Word(models.Model):
    word = models.CharField(max_length=255)
    coordinate = models.ForeignKey(Coordinate, on_delete=models.CASCADE, default=None, blank=True, null=True)


class SpeakerControl(models.Model):
    coordinate = models.ForeignKey(Coordinate, on_delete=models.CASCADE, default=None, blank=True, null=True)


class TranslationControl(models.Model):
    coordinate = models.ForeignKey(Coordinate, on_delete=models.CASCADE, default=None, blank=True, null=True)


class Sentence(models.Model):
    sentence = models.CharField(max_length=255)
    word = models.ForeignKey(Word, on_delete=models.CASCADE)
    speakerControl = models.ForeignKey(SpeakerControl, on_delete=models.CASCADE, default=None, blank=True, null=True)
    translationControl = models.ForeignKey(TranslationControl, on_delete=models.CASCADE, default=None, blank=True, null=True)


class Image(models.Model):
    id = models.CharField(max_length=255, primary_key=True)
    location = models.CharField(max_length=255, default=None, blank=True, null=True)
    word = models.ForeignKey(Word, on_delete=models.CASCADE, default=None, blank=True, null=True)
    sentence = models.ForeignKey(Sentence, on_delete=models.CASCADE, default=None, blank=True, null=True)


class ImageSet(models.Model):
    image = models.ForeignKey(Image, on_delete=models.CASCADE)


# class UserInput(models.Model): # Not used by frontend - delete later
#     TYPE_CHOICES = [
#         ('Pen', 'Pen'),
#         ('Erase', 'Erase'),
#         ('Lasso', 'Lasso'),
#     ]
#     type = models.CharField(max_length=5, choices=TYPE_CHOICES)
#
#
# class InputCoordinates(models.Model): # Not used by frontend - delete later
#     coordinate = models.ForeignKey(Coordinate, on_delete=models.CASCADE)  -- on Cascade might be wrong for this one
#     user_input = models.ForeignKey(UserInput, on_delete=models.CASCADE)