# Create your views here.
from neomodel import Q, OUTGOING, Traversal
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import Exporting, Ateco, Sll, AtecoRel
from .utlis import QueryFilterGen, PrinQuery


class GetSll(APIView):
    def get(self, request):
        sll_names = request.GET.getlist('name')
        sll_ids = request.GET.getlist('id')

        qs_generator = QueryFilterGen()
        prin_query = PrinQuery()

        sll_qs = None

        if sll_names and len(sll_names) > 0:
            sll_qs = qs_generator.filter_sll(namelist=sll_names)
        elif sll_ids and len(sll_ids) > 0:
            sll_qs = qs_generator.filter_sll(idlist=sll_ids)

        nodeset = prin_query.get_sll(sll_qs)
        sll_list = [node.serialize for node in nodeset]
        return Response(data=dict(nodes=sll_list, rels=[]), status=status.HTTP_200_OK)


class GraphBuild(APIView):
    """
    This class queries the neo4j database based on request's parameters
    """
    def get(self, request):
        slls = request.GET.getlist('sll')

        qs_generator = QueryFilterGen()
        prin_query = PrinQuery()

        nodes = []
        nodeset = None

        # If request parameters contains one or more slls, we retrieve only them from the database
        sll_nodes = prin_query.get_sll(qs_generator.filter_sll(namelist=slls))

        nodes.append([node.serialize for node in nodeset])

        return Response(data=dict(nodes=nodes, rels=[]), status=status.HTTP_200_OK)


class Test(APIView):
    def get(self, request):
        # ateco = Ateco.nodes.get(code=3030)
        #
        # # definition = dict(node_class=Sll, direction=OUTGOING,
        # #                   relation_type=None, model=AtecoRel)
        # # relations_traversal = Traversal(ateco, Ateco.__label__,
        # #                                 definition)
        # # slls = relations_traversal.all()
        #
        # slls = ateco.slls.match(year=2012)
        #
        # for sll in slls:
        #     rel = ateco.slls.all_relationship(sll)
        #     print(rel)
        #
        # print(slls)

        slls = request.GET.getlist('sll')

        qs_generator = QueryFilterGen()
        prin_query = PrinQuery()

        nodes = []
        relationships = []
        nodeset = None

        # If request parameters contains one or more slls, we retrieve only them from the database
        sll_nodes = prin_query.get_sll(qs_generator.filter_sll(namelist=slls))

        nodes.extend([node.serialize for node in sll_nodes])

        atecos = []
        for sll in sll_nodes:
            node_ateco = sll.atecos.match(year=2012)

            print(len(node_ateco))
            for ateco in node_ateco:
                ateco_serial = ateco.serialize
                if not ateco_serial in nodes:
                    nodes.append(ateco_serial)

                relationships.append(dict(id=f"{sll.id}-{ateco.id}", source=ateco.id, target=sll.id))

        return Response(data=dict(nodes=nodes, rels=relationships), status=status.HTTP_200_OK)
