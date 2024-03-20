function request(endpoint, parameters = undefined, callback = undefined) {
    $.ajax({
        type: 'GET',
        dataType: "json",
        url: endpoint,
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
