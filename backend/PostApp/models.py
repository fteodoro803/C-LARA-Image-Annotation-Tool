from django.db import models

# class Word(models.Model):   # delete this later
#     word = models.CharField(max_length=100)
#     coordinates = models.JSONField(default=list)
#     speakerControl = models.JSONField(default=list)
#     translationControl = models.JSONField(default=list)
#
#     def __str__(self):
#         return self.word


class Word(models.Model):
    word = models.CharField(max_length=255)
    coordinates = models.JSONField(default=list)
    imageID = models.ForeignKey('Image', on_delete=models.CASCADE, default=None, blank=True, null=True)


class SpeakerControl(models.Model):
    coordinates = models.JSONField(default=list)


class TranslationControl(models.Model):
    coordinates = models.JSONField(default=list)


class Sentence(models.Model):
    sentence = models.CharField(max_length=255)
    imageID = models.ForeignKey('Image', on_delete=models.CASCADE, default=None, blank=True, null=True)
    speakerControlID = models.ForeignKey('SpeakerControl', on_delete=models.CASCADE, default=None, blank=True, null=True)
    translationControlID = models.ForeignKey('TranslationControl', on_delete=models.CASCADE, default=None, blank=True, null=True)

class Image(models.Model):
    name = models.CharField(max_length=255, default=None, blank=True, null=True)
    location = models.CharField(max_length=255, default=None, blank=True, null=True)
    imageSetID = models.ForeignKey('ImageSet', on_delete=models.CASCADE, default=None, blank=True, null=True)

    def __str__(self):
        return self.name

class ImageSet(models.Model):   # delete this later
    name = models.CharField(max_length=255, default=None, blank=True, null=True)
    # words = models.ManyToManyField(Word)

    def __str__(self):
        return self.name


# class ImageSet(models.Model):
#



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