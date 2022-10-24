var baseUrl = "http://127.0.0.1:8000"

function request(endpoint, parameters = undefined, callback = undefined) {
    var chain = baseUrl + endpoint;
    $.ajax({
        type: 'GET',
        dataType: "json",
        url: chain,
        success: callback,
        data: parameters
    })
}

function getSLL(Regione, callback) {
    var parameters = {
        region: Regione
    }
    request("/api/slls", parameters, callback);
}

function getCluster(callback) {
    request("/api/exportings", null,  callback);
}

function getGraph(clusterName, anno = 2019, callback) {
    var parameters = {
        e: clusterName,
    }
    request("/api/complete", parameters,  callback);
}

function uploadData(data) {
    var elements;
    if (Array.isArray(data)) {
        elements = data.map(element => {
            return {group: element.group, data: element}
        });
    } else {
        const nodes = data.nodes;
        const rels = data.rels;

        const cyNodes = nodes.map((node) => {
            return {data: node}
        });

        const cyRels = rels.map((rel) => {
            return {data: rel}
        });

        elements = {
            nodes: cyNodes,
            edges: cyRels
        };
    }
    window.cy.add(elements);
    window.cy.layout({
        name: 'd3-force',
        animate: true,
        linkId: function id(d) {
            return d.id;
        },
        linkDistance: 10,
        manyBodyStrength: -300,
        randomize: false,
        infinite: true
    }).run();
}
