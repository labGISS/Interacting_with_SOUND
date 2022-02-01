from django.shortcuts import render
from .models import *


# Create your views here.

def index(request):
    return render(request, 'prin/index.html')


def test(request):
    return render(request, 'prin/test.html')


def home(request):
    return render(request, 'prin/home.html')
