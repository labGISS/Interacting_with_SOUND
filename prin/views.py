from django.shortcuts import render
from api.models import Exporting
from prin.utils import split


# Create your views here.

def home(request):
    return render(request, 'prin/home.html')


def info(request):
    return render(request, 'prin/info.html')


def analytics(request):
    try:
        exporting = [exporting.serialize for exporting in Exporting.nodes.all()]
        exporting_sublist = split(exporting, 8)
        exporting_sublist = [l for l in exporting_sublist]

        return render(request, 'prin/analytics.html', context={'exporting_list': exporting,
                                                               'exporting_sublist': exporting_sublist})
    except Exception as err:
        return render(request, 'prin/analytics.html', context={'error': str(err)})
