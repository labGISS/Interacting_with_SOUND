match (c:Exporting {name: "HOSPITALITY AND TOURISM"})-[contiene:CLUSTER_CONTIENE]-(a:Ateco)-[relaziona:CLUSTER_RELAZIONA]-(s:Sll) 
where c.name = relaziona.cluster and relaziona.year = 2012 // and relaziona.units > 40
with c, contiene, a, relaziona, s
match (e:Emerging)-[cont:CLUSTER_CONTIENE]-(a)-[rel2]-(s2)
where rel2.cluster = e.name and rel2.year = relaziona.year // and rel2.units > 40
return c, contiene, a, relaziona, s, cont, e, rel2, s2




match (c:Emerging {name: "Blue growth"})-[contiene:CLUSTER_CONTIENE]-(a:Ateco)-[relaziona:CLUSTER_RELAZIONA]-(s:Sll) 
where c.name = relaziona.cluster and relaziona.year = 2012
with c, contiene, a, relaziona, s
match (e:Exporting)-[cont:CLUSTER_CONTIENE]-(a)
return c, contiene, a, relaziona, s, cont, e