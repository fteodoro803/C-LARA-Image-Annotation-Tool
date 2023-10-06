from django.urls import path
from . import views

urlpatterns = [
    path('posts/', views.PostView.as_view(), name= 'posts_list'),
    path('words/', views.WordListView.as_view(), name='word-list'),  #~note test for word dropdown list
    path('add_word/', views.AddWord.as_view(), name='add-word'),    # ~note test for adding word from Frontend
    path('delete_word/', views.DeleteWord.as_view(), name='delete-word'),  # ~note test for deleting word from Frontend
    path('delete_coordinate/', views.DeleteCoordinate.as_view(), name='delete_coordinate'),  # ~note test for deleting word and coordinate pair from Frontend
    path('add_coordinates/', views.AddCoordinates.as_view(), name='add-coordinates'),  # ~note test for adding multiple words from Frontend
    path('upload/', views.upload_image, name='upload_image'), #~note test for uploading image from Frontend
    path('list_images/', views.list_images, name='list-images'), #~note test for listing images from Frontend
    path('list_image_names/', views.list_image_names, name='list_image_names'),
]

# I feel like /api images /api/upload may need to be checked. Coz the others work, but the last two dont