from neomodel import Q

from api.models import Sll


class QueryFilterGen(object):
    def Qs_OR(self, filter_attribute, itemlist):
        """
        Generate an OR of Q objects for each item of item list, where the filtering is on filter_attribute parameter.
        For example, if filter_attribute = name and itemlist=["Alice", "Bob"], this methods returns this Qs object:
        Qs = Q(name='Alice') | Q(name='Bob')

        Returns None if itemlist is empty
        :param filter_attribute database attribute to query
        :param itemlist list of items to filter with an or
        """
        Qs = None
        if itemlist and len(itemlist) > 0:
            for item in itemlist:
                kwargs = {filter_attribute: item}
                Qs = Q(**kwargs) if not Qs else Qs | Q(**kwargs)

        return Qs

    def filter_sll(self, namelist=None, idlist=None):
        """
        Returns an OR of filtering Q objects suitable for retrieve multiple Slls from database. Filtering can
        be on name attribute or id attribute. Despite of the name, the parameter can be also a single element instead
        of a list
        :param namelist: item or itemlist of Sll names to retrieve from database
        :param idlist: item or itemlist of Sll ids to retrieve from database
        :return: an OR of Q objects
        """
        attribute = None
        datalist = []

        if namelist:
            attribute = 'name'
            # SLL names are in upper case into database
            datalist = [item.upper() for item in list(namelist)]
        elif idlist:
            attribute = 'id'
            datalist = list(idlist)

        return self.Qs_OR(attribute, list(datalist))


class PrinQuery(object):
    def get_sll(self, qs_object):
        """
        Returns all slls from database filtered by the Qs object (created by QueryFilterGen.filter_sll) or all slls
        if Qs is None
        :param qs_object: Filtering Qs object
        :return: Slls from database
        """
        if qs_object:
            nodeset = Sll.nodes.filter(qs_object)
        else:
            # else, we retrieve all slls
            nodeset = Sll.nodes.all()

        return nodeset

