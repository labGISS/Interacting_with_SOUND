from neomodel import StructuredNode, StructuredRel, StringProperty, IntegerProperty, FloatProperty, Relationship, \
    RelationshipTo, RelationshipFrom
from neomodel.contrib.spatial_properties import PointProperty


# Create your models here.

class AtecoRel(StructuredRel):
    cluster = StringProperty()
    year = IntegerProperty()
    units = IntegerProperty()
    employees_avg = FloatProperty()

    @property
    def serialize(self):
        return {
            'id': self.element_id,
            'source': self.start_node().element_id,
            'target': self.end_node().element_id,
            'cluster': self.cluster,
            'year': self.year,
            'units': self.units,
            'employee_avg': self.employees_avg,
            'group': 'edges'
        }


class ClusterContieneRel(StructuredRel):
    @property
    def serialize(self):
        return {
            'id': self.element_id,
            'source': self.start_node().element_id,
            'target': self.end_node().element_id,
            'group': 'edges'
        }


class Sll(StructuredNode):
    code = StringProperty(unique_index=True)
    name = StringProperty(index=True)
    ncom = IntegerProperty()
    population = IntegerProperty()
    area = IntegerProperty()
    loc = PointProperty(crs='wgs-84')

    atecos = RelationshipFrom('Ateco', 'CLUSTER_RELAZIONA', model=AtecoRel)

    @property
    def serialize(self):
        return {
            'id': self.element_id,
            'labels': self.labels(),
            'code': self.code,
            'name': self.name,
            'ncom': self.ncom,
            'population': self.population,
            'area': self.area,
            'lat': self.loc.coords[0][1],
            'lng': self.loc.coords[0][0],
            'group': 'nodes'
        }


class Ateco(StructuredNode):
    code = StringProperty(unique_index=True)
    description = StringProperty()

    slls = RelationshipTo('Sll', 'CLUSTER_RELAZIONA', model=AtecoRel)

    @property
    def serialize(self):
        return {
            'id': self.element_id,
            'labels': self.labels(),
            'code': self.code,
            'description': self.description,
            'group': 'nodes'
        }


# class Cluster(StructuredNode):
#     name = StringProperty()
#     atecos = Relationship(Ateco, 'CLUSTER_CONTIENE')
#
#     @property
#     def serialize(self):
#         return {
#             'id': self.element_id,
#             'labels': self.labels(),
#             'name': self.name,
#         }


class Exporting(StructuredNode):
    name = StringProperty()
    atecos = Relationship(Ateco, 'CLUSTER_CONTIENE', model=ClusterContieneRel)

    @property
    def serialize(self):
        return {
            'id': self.element_id,
            'labels': self.labels(),
            'name': self.name,
            'group': 'nodes'
        }


class Emerging(StructuredNode):
    name = StringProperty()
    atecos = Relationship(Ateco, 'CLUSTER_CONTIENE', model=ClusterContieneRel)

    @property
    def serialize(self):
        return {
            'id': self.element_id,
            'labels': self.labels(),
            'name': self.name,
            'group': 'nodes'
        }
