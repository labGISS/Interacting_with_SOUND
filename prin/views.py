from django.shortcuts import render
from .models import *


# Create your views here.

def index(request):
    return render(request, 'prin/index.html')


def test(request):
    return render(request, 'prin/test.html')


def home(request):
    return render(request, 'prin/home.html')


def index_new(request):
    return render(request, 'prin/index-new.html')


def info(request):
    return render(request, 'prin/info.html')


def analytics(request):
    selected_regione = request.GET.get('Regione')

    if selected_regione:
        ctx = {"regione": selected_regione}
        return render(request, 'prin/analytics.html', ctx)
    else:
        return render(request, 'prin/analytics.html')
