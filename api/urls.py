from django.conf.urls import url
from .views import GetSll, GraphBuild, Test, ClusterTest, CompleteQuery, GetExporting, GetCusters

app_name = 'api'
urlpatterns = [
    url(r'^slls[/]?$', GetSll.as_view(), name='get_sll_data'),
    url(r'^exportings[/]?$', GetExporting.as_view(), name='get_exportings'),
    url(r'^graph[/]?$', GraphBuild.as_view(), name='get_graph'),
    url(r'^test[/]?$', Test.as_view(), name='test_api'),
    url(r'^cluster[/]?$', ClusterTest.as_view(), name='cluster_test'),
    url(r'^clusters[/]?$', GetCusters.as_view(), name='get_clusters'),
    url(r'^complete[/]?$', CompleteQuery.as_view(), name='complete_query'),
]
