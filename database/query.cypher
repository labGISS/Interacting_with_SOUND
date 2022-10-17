MATCH (ex:Exporting {name: "DISTRIBUTION AND ELECTRONIC COMMERCE"})-[ex_contiene:CLUSTER_CONTIENE]-(a:Ateco)-[ex_relaziona:CLUSTER_RELAZIONA]-(s:Sll) 
WHERE ex.name = ex_relaziona.cluster and ex_relaziona.year = 2018 and (ex_relaziona.units > 0 or ex_relaziona.employees_avg > 0)
WITH ex, ex_contiene, a, ex_relaziona, s
MATCH (em:Emerging)-[em_contiene:CLUSTER_CONTIENE]-(a)-[em_relaziona:CLUSTER_RELAZIONA]-(s2:Sll)
WHERE em_relaziona.cluster = em.name and em_relaziona.year = ex_relaziona.year and (em_relaziona.units > 0 or em_relaziona.employees_avg > 0)
RETURN ex, ex_contiene, a, ex_relaziona, s, em, em_contiene, em_relaziona, s2


match (c:Emerging {name: "Blue growth"})-[contiene:CLUSTER_CONTIENE]-(a:Ateco)-[relaziona:CLUSTER_RELAZIONA]-(s:Sll) 
where c.name = relaziona.cluster and relaziona.year = 2012
with c, contiene, a, relaziona, s
match (e:Exporting)-[cont:CLUSTER_CONTIENE]-(a)
return c, contiene, a, relaziona, s, cont, e