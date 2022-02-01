from prin.views import *
from django.urls import path

urlpatterns = [
    path('', index),
    path('test/', test),
    path('home/', home)
]
