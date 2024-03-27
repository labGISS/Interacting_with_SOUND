from prin.views import *
from django.urls import path

app_name = 'prin'
urlpatterns = [
    path('index/', home, name="index"),
    path('analytics/', analytics, name="analytics"),
    path('info/', info, name="info"),
    path('', home),
]
