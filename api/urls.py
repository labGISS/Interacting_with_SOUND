from django.urls import re_path
from .views import GetSll, GraphBuild, Test, ClusterTest, CompleteQuery, GetExporting, GetCusters

app_name = 'api'
urlpatterns = [
    re_path(r'^slls[/]?$', GetSll.as_view(), name='get_sll_data'),
    re_path(r'^exportings[/]?$', GetExporting.as_view(), name='get_exportings'),
    re_path(r'^graph[/]?$', GraphBuild.as_view(), name='get_graph'),
    re_path(r'^test[/]?$', Test.as_view(), name='test_api'),
    re_path(r'^cluster[/]?$', ClusterTest.as_view(), name='cluster_test'),
    re_path(r'^clusters[/]?$', GetCusters.as_view(), name='get_clusters'),
    re_path(r'^complete[/]?$', CompleteQuery.as_view(), name='complete_query'),
]
