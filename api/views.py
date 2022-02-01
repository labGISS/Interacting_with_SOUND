# Create your views here.
from neomodel import Q, OUTGOING, Traversal, db
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import Exporting, Ateco, Sll, AtecoRel, Emerging, Exporting, ClusterContieneRel
from .utlis import QueryFilterGen, PrinQuery

from time import time

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


class GetExporting(APIView):
    def get(self, request):
        res = [exporting.serialize for exporting in Exporting.nodes.all()]
        print(res)

        return Response(data=res)

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


class ClusterTest(APIView):

    def get(self, request):
        exporting_name = request.GET.get('exporting')
        nodes, relationships = [], []

        # Getting the exporting cluster
        exporting_node = Exporting.nodes.get(name=exporting_name)
        nodes.append(exporting_node.serialize)

        # Getting the atecos
        atecos = exporting_node.atecos

        su = 0

        for ateco in atecos:
            print("----------------")
            nodes.append(ateco.serialize)
            relationships.append(dict(id=f"{exporting_node.id}-{ateco.id}", source=exporting_node.id, target=ateco.id))

            # Getting slls that contains current ateco
            ateco_slls = ateco.slls.match(cluster=exporting_name, year=2012, units__gt=40)
            for sll in ateco_slls:
                nodes.append(sll.serialize)
                relationships.append(dict(id=f"{ateco.id}-{sll.id}", source=ateco.id, target=sll.id))

        return Response(data=dict(nodes=nodes, rels=relationships), status=status.HTTP_200_OK)


class CompleteQuery(APIView):

    def get(self, request):
        exporting = request.GET.get('exporting')

        query = """match (c:Exporting {name: $exporting})-[contiene:CLUSTER_CONTIENE]-(a:Ateco)-[relaziona:CLUSTER_RELAZIONA]-(s:Sll) 
        where c.name = relaziona.cluster and relaziona.year = 2012 and relaziona.units > 0
        with c, contiene, a, relaziona, s
        match (e:Emerging)-[cont:CLUSTER_CONTIENE]-(a)-[rel2]-(s2)
        where rel2.cluster = e.name and rel2.year = relaziona.year and rel2.units > 0
        return c, contiene, a, relaziona, s, cont, e, rel2, s2"""

        classes = {
            'c': Exporting,
            'contiene': ClusterContieneRel,
            'a': Ateco,
            'relaziona': AtecoRel,
            's': Sll,
            'cont': ClusterContieneRel,
            'e': Emerging,
            'rel2': AtecoRel,
            's2': Sll
        }

        print("Seraching results for ", exporting)
        result, meta = db.cypher_query(query, {'exporting': exporting})
        print("Results: ", len(result))

        added_ids = []
        to_return = []

        start_time = time() * 1000
        for row in result:
            zippo = zip(meta, row)

            for m, el in zippo:
                if el.id in added_ids:
                    continue

                inflate_start = time() * 1000
                element = classes[m].inflate(el).serialize
                # if not element['id'] in added_ids[element['group']]:
                to_return.append(element)
                # added_ids[element["group"]].append(element["id"])
                added_ids.append(el.id)

                inflate_end = time() * 1000
                # print(f"Inflate time: {inflate_end-inflate_start}")

        end_time = time() * 1000

        print(f"Returning {len(to_return)} elements from {len(result)} rows. Time: {end_time-start_time} ms")
        return Response(data=to_return, status=status.HTTP_200_OK)
