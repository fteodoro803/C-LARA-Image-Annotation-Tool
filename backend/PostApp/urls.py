from django.urls import path
from . import views

urlpatterns = [
    path('posts/', views.PostView.as_view(), name= 'posts_list'),
    path('words/', views.WordListView.as_view(), name='word-list'),  #~note test for word dropdown list
]