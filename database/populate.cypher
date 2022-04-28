// Questo script popola il database prin secondo lo schema definito in DESCRIZIONE.txt
// Assicurarsi che neo4j possa conntettersi a internet, oppure che i file Ateco2007.csv, emerging.csv, exporting.csv, emerging_clusters.csv, exporting_clusters.csv e sll_centroid.csv 
// siano presenti nella cartella neo4j/import. 
// Tali file possono essere generati mediante gli script prensenti nel progetto prin_tools

// !!! NOTA: Questo script è compatibile con neo4j VERSIONE 4.4 (E SUCCESSIVE) !!!

// 0. Creazione di indici e contstraint
// 0.1 Constraint
CREATE CONSTRAINT atecoUniqueContstraint IF NOT EXISTS FOR (a:Ateco) REQUIRE a.code IS UNIQUE
CREATE CONSTRAINT sllUniqueConstraint IF NOT EXISTS FOR (s:Sll) REQUIRE s.code IS UNIQUE

// 0.2 Indici
CREATE TEXT INDEX exportingNameIndex IF NOT EXISTS FOR (c:Exporting) ON (c.name)
CREATE TEXT INDEX emergingNameIndex IF NOT EXISTS FOR (c:Emerging) ON (c.name)
CREATE TEXT INDEX sllNameIndex IF NOT EXISTS FOR (s:Sll) ON (s.name)
CREATE INDEX clusterRelazionaRelClusterNameIndex IF NOT EXISTS FOR ()-[r:CLUSTER_RELAZIONA]-() ON (r.cluster)
CREATE INDEX clusterRelazionaRelYearIndex IF NOT EXISTS FOR ()-[r:CLUSTER_RELAZIONA]-() ON (r.year)

// 1. Importazione degli Ateco (url locale: file:///Ateco2007.csv)
LOAD CSV WITH HEADERS FROM "https://raw.githubusercontent.com/labGISS/prin-test/master/database/data/Ateco2007.csv" as line
CREATE (a:Ateco {
    code: line.codice,
    description: line.descrizione
})


// 2. Importazione dei Clusters
// 2.1 Exporting (uri locale: file:///exporting_clusters.csv)
:auto LOAD CSV WITH HEADERS FROM "https://raw.githubusercontent.com/labGISS/prin-test/master/database/data/exporting_clusters.csv" as line
CALL {
    WITH line
    MATCH (a:Ateco {code: line.ateco})
    WITH a, line
    MERGE (c:Exporting {
        name: line.cluster
    })
    MERGE (c)-[:CLUSTER_CONTIENE]->(a)
} IN TRANSACTIONS OF 500 ROWS

// 2.2 Emerging (uri locale: file:///emerging_clusters.csv)
:auto LOAD CSV WITH HEADERS FROM "https://raw.githubusercontent.com/labGISS/prin-test/master/database/data/emerging_clusters.csv" as line
CALL {
    WITH line
    MATCH (a:Ateco {code: line.ateco})
    WITH a, line
    MERGE (c:Emerging {
        name: line.cluster
    })
    MERGE (c)-[:CLUSTER_CONTIENE]->(a)
} IN TRANSACTIONS OF 500 ROWS

// 3. Importazione Sll (uri locale: file:///sll_centroid.csv)
LOAD CSV WITH HEADERS FROM "https://raw.githubusercontent.com/labGISS/prin-test/master/database/data/sll_centroid.csv" as line
CREATE (s:Sll {
    code: toInteger(line.SLL_2011),
    name: line.DEN_SLL_20,
    ncom: toInteger(line.N_COMUNI_2),
    population: toInteger(line.POP_2011),
    area: toInteger(line.AREA),
    loc: point({longitude: toFloat(line.lng), latitude: toFloat(line.lat)})
})


// 4. Importazione relazioni Ateco-Sll
// 4.1 Exporting (uri locale: file:///exporting.csv)
:auto LOAD CSV WITH HEADERS FROM "https://raw.githubusercontent.com/labGISS/prin-test/master/database/data/exporting.csv" as line
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
} IN TRANSACTIONS OF 500 ROWS

// 4.2 Emerging (uri locale: file:///emerging.csv)
:auto LOAD CSV WITH HEADERS FROM "https://raw.githubusercontent.com/labGISS/prin-test/master/database/data/emerging.csv" as line
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
} IN TRANSACTIONS OF 500 ROWS
