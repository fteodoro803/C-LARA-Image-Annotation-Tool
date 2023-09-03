from rest_framework import serializers
from .models import Post

# Converts between Python Data and API JSON
class PostSerializer(serializers.ModelSerializer):
    class Meta:
        model = Post
        fields = '__all__'