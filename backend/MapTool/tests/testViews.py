from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from django.core.files.uploadedfile import SimpleUploadedFile
from io import BytesIO
from PIL import Image as PILImage
from ..models import Image, Word


class ImageTests(APITestCase):

    def setUp(self):
        # Creating initial instances to be used in the tests
        self.image = Image.objects.create(name='test_image', file='path/to/your/image.png')
        self.word = Word.objects.create(word='test_word', imageID=self.image)

    def testUploadValidImage(self):
        # Testing image upload functionality with a valid image file
        url = reverse('upload')
        image_file = BytesIO()
        image = PILImage.new('RGB', (100, 100), 'white')
        image.save(image_file, 'png')
        image_file.seek(0)
        data = {
            'name': 'test_image',  # Adding the name data
            'image': SimpleUploadedFile('test_image.png', image_file.read(), content_type='image/png')
        }
        response = self.client.post(url, data, format='multipart')

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Image.objects.count(), 2)  # Check if a new image is added
        self.assertIn('test_image', [i.name for i in Image.objects.all()])  # Check if new image is correctly named

    def testUploadInvalidFile(self):
        # Testing image upload functionality with an invalid file type
        url = reverse('upload')
        data = {'image': SimpleUploadedFile('test_file.txt', b'test content', content_type='text/plain')}
        response = self.client.post(url, data, format='multipart')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(Image.objects.count(), 1)  # Ensure no new image is added

    def testListImages(self):
        # Testing the retrieval of a list of images
        url = reverse('list_images')
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('test_image', str(response.data))  # Check if the uploaded image is in the list

    def testDeleteImage(self):
        # Testing the deletion of an image
        url = reverse('delete_image', args=[self.image.id])
        response = self.client.delete(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(Image.objects.count(), 0)  # Check if the image is deleted

    # Upload Image View Tests
    def testUploadImageWithoutName(self):
        url = reverse('upload')
        image_file = BytesIO()
        image = PILImage.new('RGB', (100, 100), 'white')
        image.save(image_file, 'png')
        image_file.seek(0)
        data = {
            'image': SimpleUploadedFile('test_image.png', image_file.read(), content_type='image/png')
        }
        response = self.client.post(url, data, format='multipart')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def testUploadImageWithoutFile(self):
        url = reverse('upload')
        data = {'name': 'test_image'}
        response = self.client.post(url, data, format='multipart')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def testUploadUnsupportedImageFormat(self):
        url = reverse('upload')
        image_file = BytesIO()
        image = PILImage.new('RGB', (100, 100), 'white')
        image.save(image_file, 'bmp')
        image_file.seek(0)
        data = {
            'name': 'test_image',
            'image': SimpleUploadedFile('test_image.bmp', image_file.read(), content_type='image/bmp')
        }
        response = self.client.post(url, data, format='multipart')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    # GetImageView Test
    def testGetImageInvalidId(self):
        url = reverse('get_image', args=[999])  # Assuming 999 is an invalid ID
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    # DeleteImageView Test
    def testDeleteImageInvalidId(self):
        url = reverse('delete_image', args=[999])  # Assuming 999 is an invalid ID
        response = self.client.delete(url)

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)


class WordTests(APITestCase):

    def setUp(self):
        self.image = Image.objects.create(name='test_image', file='path/to/your/image.png')

    def testAddWord(self):
        # Testing addition of a Word
        url = reverse('add_word')
        data = {'word': 'test_word', 'image_id': self.image.id}
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Word.objects.count(), 1)

    def testListWords(self):
        # Testing retrieval of a list of Words associated with an Image
        Word.objects.create(word='test_word', imageID=self.image)
        url = reverse('list_words', args=[self.image.id])
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

    def testDeleteWord(self):
        # Testing deletion of a Word
        word = Word.objects.create(word='test_word', imageID=self.image)
        url = reverse('delete_word', args=[word.id])
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(Word.objects.count(), 0)

    def testEditWord(self):
        # Testing editing of a Word
        word = Word.objects.create(word='test_word', imageID=self.image)
        url = reverse('edit_word', args=[word.id])
        data = {'word': 'new_test_word'}
        response = self.client.put(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(Word.objects.get(id=word.id).word, 'new_test_word')

    # Add Words View Tests
    def testAddWordWithoutWordField(self):
        url = reverse('add_word')
        data = {'image_id': self.image.id}
        response = self.client.post(url, data)

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def testAddWordWithoutImageId(self):
        url = reverse('add_word')
        data = {'word': 'test_word'}
        response = self.client.post(url, data)

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def testAddWordWithInvalidImageId(self):
        url = reverse('add_word')
        data = {'word': 'test_word', 'image_id': 999}  # Assuming 999 is an invalid ID
        response = self.client.post(url, data)

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    # ListWordsView Test
    def testListWordsInvalidImageId(self):
        url = reverse('list_words', args=[999])  # Assuming 999 is an invalid ID
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    # DeleteWordView Tests
    def testDeleteWordInvalidId(self):
        url = reverse('delete_word', args=[999])  # Assuming 999 is an invalid ID
        response = self.client.delete(url)

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    # EditWordView Tests
    def testEditWordInvalidId(self):
        url = reverse('edit_word', args=[999])  # Assuming 999 is an invalid ID
        data = {'word': 'new_test_word'}
        response = self.client.put(url, data, format='json')

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def testEditWordInvalidData(self):
        word = Word.objects.create(word='test_word', imageID=self.image)
        url = reverse('edit_word', args=[word.id])
        data = {'word': ''}  # Empty word field
        response = self.client.put(url, data, format='json')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


class CoordinateTests(APITestCase):

    def setUp(self):
        self.image = Image.objects.create(name='test_image', file='path/to/your/image.png')
        self.word = Word.objects.create(word='test_word', imageID=self.image)

    def testAddCoordinates(self):
        # Testing addition of coordinates to a Word
        url = reverse('add_coordinates')
        data = {'word_id': self.word.id, 'coordinates': [[0, 0], [1, 1]]}
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.word.refresh_from_db()  # Refresh the object after the update
        self.assertEqual(self.word.coordinates, [[0, 0], [1, 1]])

    def testFetchCoordinates(self):
        # Testing retrieval of coordinates and toolUsed for a Word
        self.word.coordinates = [[0, 0], [1, 1]]
        self.word.toolUsed = 'some_tool'
        self.word.save()
        url = reverse('fetch_coordinates', args=[self.word.id])
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data, {
            "word_id": self.word.id,
            "coordinates": [[0, 0], [1, 1]],
            "toolUsed": 'some_tool'
        })

    def testAddEmptyCoordinates(self):
        # Testing addition of empty coordinates to a Word
        url = reverse('add_coordinates')
        data = {'word_id': self.word.id, 'coordinates': None}
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.word.refresh_from_db()
        self.assertEqual(self.word.coordinates, [])

    # AddCoordinatesView Tests
    def testAddCoordinatesWithoutWordId(self):
        url = reverse('add_coordinates')
        data = {'coordinates': [[0, 0], [1, 1]]}
        response = self.client.post(url, data, format='json')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def testAddCoordinatesInvalidWordId(self):
        url = reverse('add_coordinates')
        data = {'word_id': 999, 'coordinates': [[0, 0], [1, 1]]}  # Assuming 999 is an invalid ID
        response = self.client.post(url, data, format='json')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    # Add Test for Invalid Coordinates  ~note

    # FetchCoordinatesView Test
    def testFetchCoordinatesInvalidWordId(self):
        url = reverse('fetch_coordinates', args=[999])  # Assuming 999 is an invalid ID
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
