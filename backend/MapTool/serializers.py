# serializers.py
from rest_framework import serializers
from .models import Image, Word

class ImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Image
        fields = ('id', 'name', 'file')

class WordSerializer(serializers.ModelSerializer):
    class Meta:
        model = Word
        fields = ('id', 'word', 'coordinates', 'imageID')