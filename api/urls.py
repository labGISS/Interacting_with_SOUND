from django.conf.urls import url
from .views import GetSll, GraphBuild, Test

app_name = 'api'
urlpatterns = [
    url(r'^slls[/]?$', GetSll.as_view(), name='get_sll_data'),
    url(r'^graph[/]?$', GraphBuild.as_view(), name='get_graph'),
    url(r'^test[/]?$', Test.as_view(), name='test_api'),
]
