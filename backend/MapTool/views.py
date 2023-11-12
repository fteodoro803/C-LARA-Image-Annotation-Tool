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
from django.http import Http404
from django.views import View
from django.http import FileResponse

# Create your views here.
class UploadImageView(APIView):
    parser_classes = (FormParser, MultiPartParser)

    def post(self, request, *args, **kwargs):
        image = request.FILES.get('image')
        name = request.data.get('name')

        # Check if the uploaded file is an image
        if image and self.is_image(image) and name:
            upload = Image.objects.create(name=name, file=image)
            upload.save()
            return Response({
                "message": "Uploaded successfully!",
                "imageName": upload.name,
                "imageLocation": upload.file.url
            }, status=status.HTTP_201_CREATED)
        else:
            return Response({
                "message": "Invalid request. A valid image and name are required.",
            }, status=status.HTTP_400_BAD_REQUEST)

    def is_image(self, file):
        # Check if the file has a valid image MIME type
        valid_image_types = ["image/jpeg", "image/png", "image/gif", "image/webp", "image/tiff", "image/svg+xml"]
        content_type = file.content_type
        if content_type in valid_image_types:
            return True
        return False


class ListImagesView(ListAPIView):
    queryset = Image.objects.all()
    serializer_class = ImageSerializer


class GetImageView(APIView):
    def get(self, request, image_id, format=None):
        # Getting the image or returning a 404 if not found
        image_obj = get_object_or_404(Image, pk=image_id)

        # Check if the image file exists
        if image_obj.file and image_obj.file.storage.exists(image_obj.file.name):
            # Returning the image as a response
            response = FileResponse(image_obj.file)
            return response
        else:
            # Sending a response if the image doesn't exist
            return Response({"message": "Image not found."}, status=status.HTTP_404_NOT_FOUND)

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

        return Response({"message": "Image deleted."})  # Make this Response more detailed

class AddWordView(APIView):
    def post(self, request, *args, **kwargs):
        word_text = request.data.get('word')
        image_id = request.data.get('image_id')

        image_in_database = Image.objects.filter(id=image_id).exists()

        if word_text and image_id and image_in_database:
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

        # Check if the Image with the given image_id exists
        if not Image.objects.filter(id=image_id).exists():
            raise Http404("Image not found")

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
        tool_used = request.data.get('toolUsed')

        # Check if the word exists in the database
        if not Word.objects.filter(id=word_id).exists():
            return Response({
                "message": "Invalid request. Word ID does not exist.",
            }, status=status.HTTP_400_BAD_REQUEST)

        if word_id:
            word = Word.objects.get(id=word_id)

            # If new_coordinates is an empty string, set it to an empty list
            if new_coordinates == None:
                new_coordinates = []

            # Assuming coordinates is a list of lists
            word.coordinates = new_coordinates
            word.toolUsed = tool_used

            word.save()
            return Response({
                "message": "Coordinates added successfully!",
                "word_id": word.id,
                "coordinates": word.coordinates,
                "toolUsed": word.toolUsed
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
            toolUsed = word.toolUsed
            return Response({
                "word_id": word.id,
                "coordinates": coordinates,
                "toolUsed": toolUsed
            }, status=status.HTTP_200_OK)

        except Word.DoesNotExist:
            return Response({
                "message": "Word not found."
            }, status=status.HTTP_404_NOT_FOUND)


class JSONOutputView(View):
    def get(self, request, *args, **kwargs):
        images = Image.objects.all()
        output = []

        for image in images:
            segments = []

            words = Word.objects.filter(imageID=image)  # Get all associated Word objects

            for word in words:
                segments.append({
                    "item": word.word,
                    "coordinates": word.coordinates,
                })

            output.append({
                "image_id": image.name,
                "segments": segments,
            })

        return JsonResponse(output, safe=False, json_dumps_params={'indent': 4})  # Adding indent to prettify the JSON
