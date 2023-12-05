from prin.views import *
from django.urls import path

urlpatterns = [
    path('', index),
    path('test/', test),
    path('home/', home),
    path('index/', index_new, name="index"),
    path('analytics/', analytics, name="analytics"),
    path('info/', info, name="info")
]
