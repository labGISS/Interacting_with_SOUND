// Mirror del file populate.cypher per import in container docker
// Vedi https://paras301.medium.com/initialize-a-neo4j-docker-container-using-cypher-scripts-f4a5ded9ff52
// 0. Creazione di indici e contstraint
// 0.1 Constraint
CREATE CONSTRAINT atecoUniqueContstraint IF NOT EXISTS FOR (a:Ateco) REQUIRE a.code IS UNIQUE;
CREATE CONSTRAINT sllUniqueConstraint IF NOT EXISTS FOR (s:Sll) REQUIRE s.code IS UNIQUE;

// 0.2 Indici
CREATE TEXT INDEX exportingNameIndex IF NOT EXISTS FOR (c:Exporting) ON (c.name);
CREATE TEXT INDEX emergingNameIndex IF NOT EXISTS FOR (c:Emerging) ON (c.name);
CREATE TEXT INDEX sllNameIndex IF NOT EXISTS FOR (s:Sll) ON (s.name);
CREATE INDEX clusterRelazionaRelClusterNameIndex IF NOT EXISTS FOR ()-[r:CLUSTER_RELAZIONA]-() ON (r.cluster);
CREATE INDEX clusterRelazionaRelYearIndex IF NOT EXISTS FOR ()-[r:CLUSTER_RELAZIONA]-() ON (r.year);
