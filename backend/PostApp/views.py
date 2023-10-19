from django.shortcuts import render

from .serializers import PostSerializer
from .models import ImageSet
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response
from rest_framework.decorators import api_view, parser_classes
from rest_framework import status
from rest_framework import generics
from .models import Word
from django.http import JsonResponse
from .serializers import WordSerializer
from django.db.models import Count
from django.core.files.storage import default_storage


import json #~note test


# Create your views here.
class PostView(APIView):
    parser_classes = (MultiPartParser, FormParser)

    # def get(self, request, *args, **kwargs):
    #     posts = Post.objects.all()
    #     serializer = PostSerializer(posts, many=True)
    #     return Response(serializer.data)
    def get(self, request, *args, **kwargs):
        # images = ImageSet.image.all()
        output = {}

        # for image in images:
        #     output[image.imageID] = {}
        #     segments = []
        #
        #     words = image.word.all()  # Get all associated Word objects
        #
        #     for word in words:
        #         similar_words = Word.objects.filter(word=word.word)  # Find all Word objects with the same 'word'
        #
        #         coord_list = [list(similar_word.coordinates) for similar_word in
        #                       similar_words]  # Create list of coordinates
        #
        #         # output[post.imageName].append({
        #         #     word.word: coord_list
        #         # })
        #
        #         segments.append({
        #             "item": word.word,
        #             "coordinates": coord_list,
        #         })
        #
        #     output[image.imageName].append({
        #         "item": word.word,
        #         "coordinates": coord_list,
        #     })

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


class WordListView(generics.ListAPIView):
    queryset = Word.objects.all().distinct()   # gets all words
    serializer_class = WordSerializer

    # Returns distinct Words in Database
    # def list(self, request):
    #     queryset = self.get_queryset()
    #     words = set(word.word for word in queryset)
    #     return Response({'words': list(words)})


# Add Single Word to Database
class AddWord(APIView):
    def post(self, request, *args, **kwargs):
        word_text = request.data.get('word')
        coordinate = request.data.get('coordinate')

        # Assume you have a Post model instance you want to associate the word with
        post = ImageSet.objects.first()  # Replace this line with actual logic to get the correct Post instance

        new_word = Word.objects.create(
            word=word_text,
            coordinates=coordinate,
            # Add any other necessary fields
        )

        post.words.add(new_word)
        post.save()

        return Response({'message': 'Word added'}, status=status.HTTP_201_CREATED)


# Delete Word from Database
class DeleteWord(APIView):
    def post(self, request, *args, **kwargs):
        word_to_delete = request.data.get('word')
        Word.objects.filter(word=word_to_delete).delete()
        return Response({'message': 'Word deleted'}, status=status.HTTP_200_OK)


# Delete Word and Coordinate pair from Database
# class DeleteWordCoordinate(APIView):
#     def post(self, request, *args, **kwargs):
#         word_to_delete = request.data.get('word')
#         coordinate_to_delete = request.data.get('coordinate')
#
#         Word.objects.filter(word=word_to_delete, coordinates__contains=[coordinate_to_delete]).delete()
#         return Response({'message': 'Word and Coordinate pair deleted'}, status=status.HTTP_200_OK)

# Delete Coordinate from Database
class DeleteCoordinate(APIView):
    def post(self, request, *args, **kwargs):
        coordinate_to_delete = request.data.get('coordinate')

        # String Manipulation
        coordinate_to_delete = [char for char in coordinate_to_delete if char.isnumeric()]  # Remove all non-numeric characters
        coordinate_to_delete = [int(coord) for coord in coordinate_to_delete]   # Convert to Int

        Word.objects.filter(coordinates=coordinate_to_delete).delete()

        return Response({'message': 'Word and Coordinate pair deleted'}, status=status.HTTP_200_OK)


# Add Multiple Words to Database
class AddCoordinates(APIView):
    def post(self, request, *args, **kwargs):
        word_text = request.data.get('word')
        coordinates = request.data.get('coordinates')

        for coord in coordinates:
            Word.objects.create(word=word_text, coordinates=coord)

        return Response({'message': 'Words and coordinates added successfully'}, status=status.HTTP_201_CREATED)


# Upload Image to backend
@api_view(['POST'])
@parser_classes([FormParser, MultiPartParser])
def upload_image(request):
    image = request.FILES.get('image')
    name = request.data.get('name')

    post = ImageSet.objects.create(imageName=name, imageLocation=image)
    return Response({"message": "Uploaded successfully!", "imageName": post.imageName, "imageLocation": post.imageLocation.url})

# View all images in backend
@api_view(['GET'])
def list_images(request):
    images = ImageSet.objects.all()
    serialized_data = [{"imageName": img.imageName, "imageLocation": img.imageLocation.url} for img in images]
    return Response(serialized_data)

# Select Image in Backend
@api_view(['GET'])
def list_image_names(request):
    images = ImageSet.objects.all()
    serialized_data = PostSerializer(images, many=True).data
    return Response(serialized_data)

# Delete Image in Backend -- ~note doesn't work yet
# def delete_image(request, image_name):
#     if request.method == "DELETE":
#         try:
#             # Fetch the image using the provided image name
#             image = Post.objects.get(imageName=image_name)
#             image.imageLocation.delete(save=True)  # This will delete the image file itself
#             image.delete()  # This will delete the database record
#             return JsonResponse({'status': 'success', 'message': 'Image deleted successfully'}, status=200)
#         except Post.DoesNotExist:
#             return JsonResponse({'status': 'failure', 'message': 'Image not found'}, status=404)


class DeleteImage(APIView):
    def post(self, request, *args, **kwargs):
        image_name_to_delete = request.data.get('imageName')

        # Fetch the image object but don't delete it yet
        image_obj = ImageSet.objects.filter(imageName=image_name_to_delete).first()

        if image_obj:
            # Delete the actual image file
            if default_storage.exists(image_obj.imageLocation.name):
                default_storage.delete(image_obj.imageLocation.name)

            # Delete the image's record from the database
            image_obj.delete()

        return Response({'message': 'Image deleted'}, status=status.HTTP_200_OK)