from testings.views import *
from django.urls import path

urlpatterns = [
    path('', home),
    path('cytoscape-leaflet-test/', cytoscape_leaflet_test),
    path('home/', home),
]
