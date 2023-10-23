from django.test import TestCase
from ..models import Word, Image
from os import path

class WordModelTest(TestCase):
    """
    Test case for the Word model.
    """

    @classmethod
    def setUpTestData(cls):
        """
        Set up non-modified objects used by all test methods.
        """
        cls.image = Image.objects.create(name='test_image.jpg')

    def setUp(self):
        """
        Set up objects specific to this test method.
        """
        self.word = Word.objects.create(word='test_word', imageID=self.image)

    def testWordLabel(self):
        """
        Test the label of the word field.
        """
        field_label = self.word._meta.get_field('word').verbose_name
        self.assertEquals(field_label, 'word')

    def testWordMaxLength(self):
        """
        Test the maximum length of the word field.
        """
        max_length = self.word._meta.get_field('word').max_length
        self.assertEquals(max_length, 255)

    def testWordStr(self):
        """
        Test the string representation of the word object.
        """
        expected_str = self.word.word
        self.assertEquals(expected_str, str(self.word))

    def testWordCoordinatesDefault(self):
        """
        Test the default value of the coordinates field.
        """
        expected_default = []
        self.assertEquals(expected_default, self.word.coordinates)

    def testWordImageID(self):
        """
        Test the imageID field of the word object.
        """
        expected_imageID = self.image
        self.assertEquals(expected_imageID, self.word.imageID)

class ImageModelTest(TestCase):
    """
    Test case for the Image model.
    """

    @classmethod
    def setUpTestData(cls):
        """
        Set up non-modified objects used by all test methods.
        """
        cls.image = Image.objects.create(name='test_image.jpg')

    def setUp(self):
        """
        Set up objects specific to this test method.
        """
        self.image = Image.objects.create(name='test_image.jpg')

    def testImageLabel(self):
        """
        Test the label of the name field.
        """
        field_label = self.image._meta.get_field('name').verbose_name
        self.assertEquals(field_label, 'name')

    def testImageMaxLength(self):
        """
        Test the maximum length of the name field.
        """
        max_length = self.image._meta.get_field('name').max_length
        self.assertEquals(max_length, 255)

    def testImageFile(self):
        """
        Test the file field of the image object.
        """
        expected_file = None
        self.assertEquals(expected_file, self.image.file)

    def testImageStr(self):
        """
        Test the string representation of the image object.
        """
        expected_str = self.image.name


"""
NOTES
    - test_word_str() had an error bc of no Word String Representation
        - Solution: added __str__ method to Word model 

"""
