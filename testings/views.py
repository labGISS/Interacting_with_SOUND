from django.shortcuts import render


# Create your views here.
def cytoscape_leaflet_test(request):
    return render(request, 'testings/cytoscape-leaflet-test.html')


def home(request):
    return render(request, 'testings/home.html')
