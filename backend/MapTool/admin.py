from django.contrib import admin
from .models import Word, SpeakerControl, TranslationControl, Sentence, Image


# Register your models here.

admin.site.register(Word)
admin.site.register(SpeakerControl)
admin.site.register(TranslationControl)
admin.site.register(Sentence)
admin.site.register(Image)
