# views.py
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.generics import ListAPIView, DestroyAPIView
from rest_framework import status
from .models import Image, Word
from .serializers import ImageSerializer, WordSerializer
import os
from django.http import JsonResponse
from django.shortcuts import get_object_or_404

# Create your views here.
class UploadImageView(APIView):
    parser_classes = (FormParser, MultiPartParser)

    def post(self, request, *args, **kwargs):
        image = request.FILES.get('image')
        name = request.data.get('name')

        if image and name:
            upload = Image.objects.create(name=name, file=image)
            upload.save()
            return Response({
                "message": "Uploaded successfully!",
                "imageName": upload.name,
                "imageLocation": upload.file.url  # Return URL
            }, status=status.HTTP_201_CREATED)
        else:
            return Response({
                "message": "Invalid request. Name and image are required.",
            }, status=status.HTTP_400_BAD_REQUEST)


class ListImagesView(ListAPIView):
    queryset = Image.objects.all()
    serializer_class = ImageSerializer


class DeleteImageView(DestroyAPIView):
    queryset = Image.objects.all()

    def delete(self, request, *args, **kwargs):
        image = get_object_or_404(Image, pk=kwargs['pk'])

        # Deleting the file associated with the image
        if image.file:
            if os.path.isfile(image.file.path):
                os.remove(image.file.path)

        # Deleting the database record
        image.delete()

        return Response({"message": "Image deleted."})  # Make this Response better, like theo ther functions

class AddWordView(APIView):
    def post(self, request, *args, **kwargs):
        word_text = request.data.get('word')
        image_id = request.data.get('image_id')     #~note change this to imageID

        if word_text and image_id:
            image = Image.objects.get(id=image_id)
            word = Word.objects.create(word=word_text, imageID=image)
            word.save()
            return Response({
                "message": "Word added successfully!",
                "word": word_text,
                "wordID": word.id,
                "image": image.name,
                "imageID": image_id
            }, status=status.HTTP_201_CREATED)
        else:
            return Response({
                "message": "Invalid request. Word and image ID are required.",
            }, status=status.HTTP_400_BAD_REQUEST)


class ListWordsView(ListAPIView):
    serializer_class = WordSerializer

    def get_queryset(self):
        image_id = self.kwargs['image_id']
        return Word.objects.filter(imageID=image_id)

class DeleteWordView(DestroyAPIView):
    queryset = Word.objects.all()
    serializer_class = WordSerializer  # Include a serializer for better consistency

    def delete(self, request, *args, **kwargs):
        word = self.get_object()
        word.delete()
        return Response({"message": f"Word '{word.word}' deleted successfully."}, status=status.HTTP_200_OK)

class EditWordView(APIView):
    def put(self, request, *args, **kwargs):
        word_id = kwargs.get('word_id')
        word = get_object_or_404(Word, id=word_id)

        serializer = WordSerializer(word, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({
                "message": "Word updated successfully!",
                "word": serializer.data
            }, status=status.HTTP_200_OK)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class AddCoordinateView(APIView):
    def post(self, request, *args, **kwargs):
        word_id = request.data.get('word_id')
        new_coordinates = request.data.get('coordinates')

        if word_id:
            word = Word.objects.get(id=word_id)

            # If new_coordinates is an empty string, set it to an empty list (or maybe an empty table check with Manny) ~note
            if new_coordinates == None:
                new_coordinates = []

            # Assuming coordinates is a list of lists
            word.coordinates = new_coordinates

            word.save()
            return Response({
                "message": "Coordinates added successfully!",
                "word_id": word.id,
                "coordinates": word.coordinates
            }, status=status.HTTP_201_CREATED)
        else:
            return Response({
                "message": "Invalid request. Word ID and coordinates are required.",
            }, status=status.HTTP_400_BAD_REQUEST)


class FetchCoordinatesView(APIView):

    def get(self, request, word_id, format=None):
        try:
            word = Word.objects.get(id=word_id)
            coordinates = word.coordinates if word.coordinates else []
            return Response({
                "word_id": word.id,
                "coordinates": coordinates
            }, status=status.HTTP_200_OK)

        except Word.DoesNotExist:
            return Response({
                "message": "Word not found."
            }, status=status.HTTP_404_NOT_FOUND)
