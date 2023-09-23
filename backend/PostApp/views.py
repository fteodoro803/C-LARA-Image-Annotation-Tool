from django.shortcuts import render

from .serializers import PostSerializer
from .models import Post
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response
from rest_framework import status
from .models import Word
from django.http import JsonResponse

import json #~note test

# Create your views here.
class PostView(APIView):
    parser_classes = (MultiPartParser, FormParser)

    # def get(self, request, *args, **kwargs):
    #     posts = Post.objects.all()
    #     serializer = PostSerializer(posts, many=True)
    #     return Response(serializer.data)
    def get(self, request, *args, **kwargs):
        posts = Post.objects.all()
        output = {}

        for post in posts:
            output[post.imageName] = []

            words = post.words.all()  # Get all associated Word objects

            for word in words:
                similar_words = Word.objects.filter(word=word.word)  # Find all Word objects with the same 'word'

                coord_list = [list(similar_word.coordinates) for similar_word in
                              similar_words]  # Create list of coordinates

                # output[post.imageName].append({
                #     word.word: coord_list
                # })

                output[post.imageName].append({
                    "word": word.word,
                    "coordinates": coord_list,
                    "speakerControl": word.speakerControl,
                    "translationControl": word.translationControl
                })

        # with open('output.json', 'w') as f:  #~note test
        #     json.dump(output, f)

        return JsonResponse(output, safe=False)

    def post(self, request, *args, **kwargs):
        posts_serializer = PostSerializer(data=request.data)
        if posts_serializer.is_valid():
            posts_serializer.save()
            return Response(posts_serializer.data, status=status.HTTP_201_CREATED)
        else:
            print('error', posts_serializer.errors)
            return Response(posts_serializer.errors, status=status.HTTP_400_BAD_REQUEST)