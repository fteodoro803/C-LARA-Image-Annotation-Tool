from rest_framework import serializers
from .models import Post, Word

class WordSerializer(serializers.ModelSerializer):
    class Meta:
        model = Word
        fields = '__all__'

class PostSerializer(serializers.ModelSerializer):
    words = WordSerializer(many=True)

    class Meta:
        model = Post
        fields = '__all__'

    def create(self, validated_data):
        words_data = validated_data.pop('words')
        post = Post.objects.create(**validated_data)
        for word_data in words_data:
            Word.objects.create(**word_data)
        return post
