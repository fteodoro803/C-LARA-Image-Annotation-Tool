from django.test import TestCase, Client
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase, APIClient
from django.core.files.uploadedfile import SimpleUploadedFile
from io import BytesIO
from PIL import Image as PILImage
from ..models import Image
from ..serializers import ImageSerializer
from os import path


class UploadImageViewTestCase(APITestCase):
    def setUp(self):
        self.client = APIClient()

    """
    Tests Upload with a valid Image file.
    """
    def testUploadValidImage(self):
        url = reverse('upload')
        image_file = BytesIO()
        image = PILImage.new('RGB', (100, 100), 'white')
        image.save(image_file, 'png')
        image_file.seek(0)
        data = {
            'name': 'test_image',
            'image': SimpleUploadedFile('test_image.png', image_file.read(), content_type='image/png')
        }
        response = self.client.post(url, data, format='multipart')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Image.objects.count(), 1)
        self.assertEqual(Image.objects.get().name, 'test_image')
        self.assertIn('imageName', response.data)
        self.assertIn('imageLocation', response.data)

        # deleteImage = '..media/test_image.png'
        # if path.isfile(deleteImage.file.path):
        #     os.remove(deleteImage.file.path)

    """
    Tests Upload with an invalid Image file.
    """
    def testUploadInvalidImage(self):
        url = reverse('upload')
        data = {
            'name': 'test_image',
            'image': SimpleUploadedFile('test_image.txt', b'test', content_type='text/plain')
        }
        response = self.client.post(url, data, format='multipart')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(Image.objects.count(), 0)


# class ListImagesViewTestCase(TestCase):
#     def setUp(self):
#         self.client = APIClient()
#         self.image1 = Image.objects.create(
#             name='Test Image 1',
#             file='test_image_fvDujNl.png'
#         )
#         self.image2 = Image.objects.create(
#             name='Test Image 2',
#             file='test_image_fvDujNl.png'
#         )
#         self.url = reverse('list_images')
#
#     def testGetSingleImage(self):
#         # Test retrieving a single image
#         response = self.client.get(reverse('list_images', kwargs={'pk': self.image1.pk}))
#         image = Image.objects.get(pk=self.image1.pk)
#         serializer = ImageSerializer(image)
#         self.assertEqual(response.data, serializer.data)
#         self.assertEqual(response.status_code, status.HTTP_200_OK)
#
#     def testCreateImage(self):
#         # Test creating a new image
#         data = {
#             'name': 'Test Image 3',
#             'file': 'test_image_fvDujNl.png'
#         }
#         response = self.client.post(self.url, data, format='json')
#         self.assertEqual(response.status_code, status.HTTP_201_CREATED)
#
#     def testUpdateImage(self):
#         # Test updating an existing image
#         data = {
#             'name': 'Updated Test Image 1',
#             'file': 'test_image_fvDujNl.png'
#         }
#         response = self.client.put(reverse('images', kwargs={'pk': self.image1.pk}), data, format='json')
#         self.assertEqual(response.status_code, status.HTTP_200_OK)
#
#     def testDeleteImage(self):
#         # Test deleting an existing image
#         response = self.client.delete(reverse('delete_image', kwargs={'pk': self.image1.pk}))
#         self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
#
#     def testListImagesView(self):
#         # Test that the ListImagesView returns a list of all images
#         response = self.client.get(reverse('images'))
#         images = Image.objects.all()
#         serializer = ImageSerializer(images, many=True)
#         self.assertEqual(response.data, serializer.data)
#         self.assertEqual(response.status_code, status.HTTP_200_OK)
#
#     def testGetAllImages(self):
#         # Test retrieving all images
#         response = self.client.get(self.url)
#         images = Image.objects.all()
#         serializer = ImageSerializer(images, many=True)
#         self.assertEqual(response.data, serializer.data)
#         self.assertEqual(response.status_code, status.HTTP_200_OK)
