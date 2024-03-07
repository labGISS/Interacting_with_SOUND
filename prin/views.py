from django.shortcuts import render
from .models import *


# Create your views here.

def home(request):
    return render(request, 'prin/home.html')


def info(request):
    return render(request, 'prin/info.html')

def analytics(request):
    selected_regione = request.GET.get('Regione')

    if selected_regione:
        ctx = {"regione": selected_regione}
        return render(request, 'prin/analytics.html', ctx)
    else:
        return render(request, 'prin/analytics.html')
