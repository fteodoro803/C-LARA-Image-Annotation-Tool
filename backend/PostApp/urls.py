# urls.py
from django.urls import path
from .views import UploadImageView, ListImagesView, DeleteImageView, AddWordView, DeleteWordView, ListWordsView, EditWordView

urlpatterns = [
    #Images
    path('upload/', UploadImageView.as_view(), name='upload'),
    path('images/', ListImagesView.as_view(), name='list_images'),
    path('delete/<int:pk>/', DeleteImageView.as_view(), name='delete_image'),

    # Words
    path('words/<int:image_id>/', ListWordsView.as_view(), name='list_words'),  # List of Words for an Image
    path('add_word/', AddWordView.as_view(), name='add_word'),
    path('delete_word/<int:pk>/', DeleteWordView.as_view(), name='delete_word'),    # note, what is pk
    path('edit_word/<int:word_id>/', EditWordView.as_view(), name='edit_word'),
]
