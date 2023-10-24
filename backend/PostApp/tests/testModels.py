from django.test import TestCase
from ..models import Word, Image


class WordModelTest(TestCase):

    @classmethod
    def setUpTestData(cls):
        cls.image = Image.objects.create(name='test_image.jpg')

    def setUp(self):
        self.word = Word.objects.create(word='test_word', imageID=self.image)

    def testWordLabel(self):
        field_label = self.word._meta.get_field('word').verbose_name
        self.assertEquals(field_label, 'word')

    def testWordMaxLength(self):
        max_length = self.word._meta.get_field('word').max_length
        self.assertEquals(max_length, 255)

    def testWordStr(self):
        expected_str = self.word.word
        self.assertEquals(expected_str, str(self.word))

    def testWordCoordinatesDefault(self):
        expected_default = []
        self.assertEquals(expected_default, self.word.coordinates)

    def testWordImageID(self):
        expected_imageID = self.image
        self.assertEquals(expected_imageID, self.word.imageID)

    def testObjectCreation(self):
        self.assertTrue(isinstance(self.word, Word))
        self.assertEquals(Word.objects.count(), 1)


class ImageModelTest(TestCase):

    def setUp(self):
        self.image = Image.objects.create(name='test_image.jpg')

    def testImageLabel(self):
        field_label = self.image._meta.get_field('name').verbose_name
        self.assertEquals(field_label, 'name')

    def testImageMaxLength(self):
        max_length = self.image._meta.get_field('name').max_length
        self.assertEquals(max_length, 255)

    def testImageFile(self):
        expected_file = None
        self.assertEquals(expected_file, self.image.file)

    def testImageStr(self):
        expected_str = self.image.name
        self.assertEquals(expected_str, str(self.image))

    def testObjectCreation(self):
        self.assertTrue(isinstance(self.image, Image))
        self.assertEquals(Image.objects.count(), 1)
