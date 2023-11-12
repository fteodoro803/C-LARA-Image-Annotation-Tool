from django.db import models


class Word(models.Model):
    word = models.CharField(max_length=255)
    coordinates = models.JSONField(default=list, null=True, blank=True)
    imageID = models.ForeignKey('Image', on_delete=models.CASCADE, default=None, blank=True, null=True)
    toolUsed = models.CharField(max_length=10, default=None, blank=True, null=True)

    # Our implementation associates words with images, but can be associated with sentences for future extension:
    # sentenceID = models.ForeignKey('Sentence', on_delete=models.CASCADE, default=None, blank=True, null=True)

    def __str__(self):
        return self.word

# Not used in our implementation - here for future C-LARA extension
class SpeakerControl(models.Model):
    coordinates = models.JSONField(default=list)


# Not used in our implementation - here for future C-LARA extension
class TranslationControl(models.Model):
    coordinates = models.JSONField(default=list)


# Not used in our implementation - here for future C-LARA extension
class Sentence(models.Model):
    sentence = models.CharField(max_length=255)
    imageID = models.ForeignKey('Image', on_delete=models.CASCADE, default=None, blank=True, null=True)
    speakerControlID = models.ForeignKey('SpeakerControl', on_delete=models.CASCADE, default=None, blank=True, null=True)
    translationControlID = models.ForeignKey('TranslationControl', on_delete=models.CASCADE, default=None, blank=True, null=True)

class Image(models.Model):
    name = models.CharField(max_length=255, default=None, blank=True, null=True)
    # location = models.CharField(max_length=255, default=None, blank=True, null=True)
    file = models.ImageField(default=None, blank=True, null=True)

    # Null by default, here for future extension
    # imageSetID = models.ForeignKey('ImageSet', on_delete=models.CASCADE, default=None, blank=True, null=True)

    def __str__(self):
        return self.name


# Our implementation does not make use of this class since we only deal with one image set, but this is here
# as a potential extension for C-LARA (if a text constructor wanted to draft or create multiple image sets at
# the same time, for example)
class ImageSet(models.Model):   # delete this later
    name = models.CharField(max_length=255, default=None, blank=True, null=True)
    # words = models.ManyToManyField(Word)

    def __str__(self):
        return self.name
