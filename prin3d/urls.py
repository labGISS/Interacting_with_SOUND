from prin3d.views import *
from django.urls import path

app_name = 'prin3d'
urlpatterns = [
    path('index/', index, name="index"),
    path('grafo/', get_grafo, name="grafo"),
]
