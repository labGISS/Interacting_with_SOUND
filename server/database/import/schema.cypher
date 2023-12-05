// Mirror del file populate.cypher per import in container docker
// Vedi https://paras301.medium.com/initialize-a-neo4j-docker-container-using-cypher-scripts-f4a5ded9ff52
// 1. Importazione degli Ateco (url locale: file:///Ateco2007.csv)
LOAD CSV WITH HEADERS FROM "https://raw.githubusercontent.com/labGISS/prin-test/master/database/data/Ateco2007.csv" as line
CREATE (a:Ateco {
    code: line.codice,
    description: line.descrizione
});


// 2. Importazione dei Clusters
// 2.1 Exporting (uri locale: file:///exporting_clusters.csv)
LOAD CSV WITH HEADERS FROM "https://raw.githubusercontent.com/labGISS/prin-test/master/database/data/exporting_clusters.csv" as line
CALL {
    WITH line
    MATCH (a:Ateco {code: line.ateco})
    WITH a, line
    MERGE (c:Exporting {
        name: line.cluster
    })
    MERGE (c)-[:CLUSTER_CONTIENE]->(a)
} IN TRANSACTIONS OF 500 ROWS;

// 2.2 Emerging (uri locale: file:///emerging_clusters.csv)
LOAD CSV WITH HEADERS FROM "https://raw.githubusercontent.com/labGISS/prin-test/master/database/data/emerging_clusters.csv" as line
CALL {
    WITH line
    MATCH (a:Ateco {code: line.ateco})
    WITH a, line
    MERGE (c:Emerging {
        name: line.cluster
    })
    MERGE (c)-[:CLUSTER_CONTIENE]->(a)
} IN TRANSACTIONS OF 500 ROWS;

// 3. Importazione Sll (uri locale: file:///sll_centroid.csv)
LOAD CSV WITH HEADERS FROM "https://raw.githubusercontent.com/labGISS/prin-test/master/database/data/sll_centroid.csv" as line
CREATE (s:Sll {
    code: toInteger(line.SLL_2011),
    name: line.DEN_SLL_20,
    ncom: toInteger(line.N_COMUNI_2),
    population: toInteger(line.POP_2011),
    area: toInteger(line.AREA),
    loc: point({longitude: toFloat(line.lng), latitude: toFloat(line.lat)})
});


// 4. Importazione relazioni Ateco-Sll
// 4.1 Exporting (uri locale: file:///exporting.csv)
LOAD CSV WITH HEADERS FROM "https://raw.githubusercontent.com/labGISS/prin-test/master/database/data/exporting.csv" as line
CALL {
    WITH line
    MATCH (c:Exporting {name: line.cluster})
    MATCH (a:Ateco {code: line.ateco})
    MATCH (s:Sll {code: toInteger(line.sll_cod)})
    FOREACH(l IN (CASE WHEN toInteger(line.units) > 0 OR toFloat(line.employees_avg) > 0 THEN [line] ELSE [] END) |
        CREATE (a)-[:CLUSTER_RELAZIONA {
            cluster: c.name,
            year: toInteger(line.year),
            units: toInteger(line.units),
            employees_avg: toFloat(line.employees_avg)
        }]->(s)
    )
} IN TRANSACTIONS OF 500 ROWS;

// 4.2 Emerging (uri locale: file:///emerging.csv)
LOAD CSV WITH HEADERS FROM "https://raw.githubusercontent.com/labGISS/prin-test/master/database/data/emerging.csv" as line
CALL {
    WITH line
    MATCH (c:Emerging {name: line.cluster})
    MATCH (a:Ateco {code: line.ateco})
    MATCH (s:Sll {code: toInteger(line.sll_cod)})
    FOREACH(l IN (CASE WHEN toInteger(line.units) > 0 OR toFloat(line.employees_avg) > 0 THEN [line] ELSE [] END) |
        CREATE (a)-[:CLUSTER_RELAZIONA {
            cluster: c.name,
            year: toInteger(line.year),
            units: toInteger(line.units),
            employees_avg: toFloat(line.employees_avg)
        }]->(s)
    )
} IN TRANSACTIONS OF 500 ROWS;
