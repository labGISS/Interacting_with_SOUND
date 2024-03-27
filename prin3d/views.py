import json

from django.http import HttpRequest
from django.shortcuts import render
from django.template.response import TemplateResponse
from neomodel import db


# Create your views here.
def index(request: HttpRequest):
    return TemplateResponse(request, 'prin3d/index.html')

def get_grafo(request, fil=0):
    # # query = 'MATCH (n)-[r:contiene]->(m) WHERE r.imprese>' + str(fil) + ' RETURN { id: n.code, label:head(labels(n)), caption:n.name, lat:n.lat, lng: n.lng } as source, { id: m.code, label:head(labels(m)), caption:m.code, description:m.description} as target, { weight:log(r.imprese)/2, type:type(r), imprese: r.imprese} as rel'
    # units = fil
    #
    # query = """
    #             MATCH (s:Sll)-[r:CLUSTER_RELAZIONA]-(a:Ateco)
    #             WHERE r.units > $units
    #             RETURN { id: s.code, label:head(labels(s)), caption:s.name, lat:s.loc.latitude, lng: s.loc.longitude } as source, { id: id(a), label:head(labels(a)), caption:a.code } as target, { weight:log(r.units)/2, type:type(r), imprese: r.units} as rel
    #         """
    #
    # results, meta = db.cypher_query(query, {'units': int(units)})
    #
    # # results, meta = db.cypher_query(query)
    #
    # shapes={}
    # with open('./data/SLL.json', 'r') as f:
    #     shapes = json.load(f)
    # return TemplateResponse(request, 'prin3d/grafo.html', {'nodi': results, 'filtro': fil, 'shapes': shapes})
    return TemplateResponse(request, 'prin3d/grafo.html')
