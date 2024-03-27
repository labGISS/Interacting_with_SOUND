function request(endpoint, parameters = undefined, callback = undefined) {
    $.ajax({
        type: 'GET',
        dataType: "json",
        url: endpoint,
        success: callback,
        data: parameters
    })
}

function get3DGraph(unitsFilter, callback) {
    const parameters = {
        units: unitsFilter
    }
    request("/api/graph3d", parameters,  callback);
}

function getSLLMapData(callback) {
    request("/api/sll-map", undefined, callback);
}
