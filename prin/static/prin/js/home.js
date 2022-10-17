const NODE_COLORS = {
    'Sll': '#1f77b4',
    'Ateco': '#b41f53',
    'Exporting': '#fff600',
    'Emerging': '#66bd54'
};

const NODE_LABEL_ATTRIBUTE = {
    'Sll': 'name',
    'Ateco': 'code',
    'Exporting': 'name',
    'Emerging': 'name',
};

const ATTRIBUTES_TEXT = {
    "id": "ID",
    "labels": "Tipo",
    "code": "Codice",
    "name": "Nome",
    "ncom": "# comuni",
    "population": "Popoloazione totale",
    "area": "Area",
    "lat": "Latitudine",
    "lng": "Longitudine",
    "year": "Anno",
    "cluster": "Cluster",
    "units": "# Aziende",
    "employee_avg": "Impiegati (media)",
    "description": "Descrizione"
}

const CY_STYLE = [
    {
        selector: 'node',
        style: {
            'width': 20,
            'height': 20,
            'border-color': '#ffffff',
            'border-width': 1,
            // 'background-color': '#1f77b4',
            'background-color': function (node) {
                return NODE_COLORS[node.data()['labels'][0]];
            },
            // 'background-image': 'data:image/svg+xml;utf8,' + encodeURIComponent(`<svg width="1792" height="1792" viewBox="0 0 1792 1792" xmlns="http://www.w3.org/2000/svg"><path d="M1216 0q185 0 316.5 93.5t131.5 226.5v896q0 130-125.5 222t-305.5 97l213 202q16 15 8 35t-30 20h-1056q-22 0-30-20t8-35l213-202q-180-5-305.5-97t-125.5-222v-896q0-133 131.5-226.5t316.5-93.5h640zm-320 1344q80 0 136-56t56-136-56-136-136-56-136 56-56 136 56 136 136 56zm576-576v-512h-1152v512h1152z" fill="#fff"/></svg>`),
            // 'background-width': '60%',
            // 'background-height': '60%',
            'color': '#333333',
            'label': function(node) {
                let data = node.data();
                return data[NODE_LABEL_ATTRIBUTE[data['labels'][0]]]
            },
            'font-size': 10,
            'text-valign': 'bottom',
            'text-margin-y': 6,
            'text-background-color': '#ffffff',
            'text-background-opacity': 0.5,
            'text-background-padding': 4,
        }
    },
    {
        selector: 'node.hover',
        style: {
            'border-color': '#000000',
            'text-background-color': '#eeeeee',
            'text-background-opacity': 1
        }
    },
    {
        selector: 'node:selected',
        style: {
            'border-color': '#ff0000',
            'border-width': 6,
            'border-opacity': 0.5
        }
    },
    {
        selector: 'edge',
        style: {
            'line-color': 'rgb(161,161,161)',
            'width': 1
        }
    },
    {
        selector: 'edge.hover',
        style: {
            'line-color': '#2c2c2c'
        }
    },
    {
        selector: 'node.highlighted',
        style: {
            "border-color": '#e1125b',
            "color": "#e1125b"
        }
    },
    {
        selector: 'edge.highlighted',
        style: {
            "line-color": '#e1125b',
            "width": 1
        }
    },
];

const CY_LAYOUT = {
    name: 'd3-force',
    animate: true,
    linkId: function id(d) {
        return d.id;
    },
    linkDistance: 200,
    manyBodyStrength: -300,
    randomize: false,
    infinite: true,
    fit: false,
};


function loadCytoscape() {
    if (window.cy) {
        console.log("Destroying previous cytoscape instance");
        window.cy.destroy();
    }

    const cy = cytoscape({
        container: document.getElementById('graph'),
        layout: CY_LAYOUT,
        style: CY_STYLE
    });

    cy.on('mouseover', '*', e => {
        e.target.addClass('hover');
        e.cy.container().style.cursor = 'pointer';
    });
    cy.on('mouseout', '*', e => {
        e.target.removeClass('hover');
        e.cy.container().style.cursor = 'default';
    });

    cy.lassoSelectionEnabled(true);

    cy.on('select', 'node', function(evt){
        evt.target.neighborhood().addClass("highlighted");
        displayElementInfobox(evt.target.data())
    });

    cy.on('select', 'edge', function(evt){
        evt.target.addClass("highlighted");
        displayElementInfobox(evt.target.data())
    });

    cy.on('unselect', 'element', function(evt){
        evt.target.removeClass("highlighted");
        evt.target.neighborhood().removeClass("highlighted");
        clearElementInfobox()
    });


    // cy.resize()
    window.cy = cy;
}

function initForm() {
    const clusterSelect = $('#cluster');
    clusterSelect.change(function() {
        if ($(this).val() !== '') {
            const endpoint = clusterSelect.attr('submit-endpoint');
            console.log(endpoint, $(this).val());
            loadGraphData(endpoint, {e: $(this).val()})
        }
    });

    $.ajax({
        dataType: 'json',
        url: clusterSelect.attr('data-url'),
        type: "get", //send it through get method
        success: function(response) {
            $.each(response, function (i, item) {
                clusterSelect.append($('<option>', {
                    value: item.name,
                    text: item.name
                }));
            });
        },
        error: function(xhr) {
            //Do Something to handle error
        }
    });
}

function loadGraphData(endpoint, parameters) {
    // show loading spinner overlay
    $('.loading-overlay').css('display', 'flex');

    $.ajax({
        dataType: 'json',
        url: endpoint,
        type: "get", //send it through get method
        data: parameters,
        success: function(response) {
            const data = response;
            let elements;
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

                const cyRels = rels.map((rel)=> {
                    return {data: rel}
                });

                elements = {
                    nodes: cyNodes,
                    edges: cyRels
                };
            }

            window.graphData = elements;
            updateGraph(window.graphData);

            // hide loading spinner
            $(".loading-overlay").hide();
        },
        error: function(xhr) {
            //Do Something to handle error
        }
    });
}

function updateGraph(data) {
    // remove the map (eventually) showed
    disableMap()
    // remove current graph
    window.cy.elements().remove();

    console.log(data);

    window.cy.add( data );
    window.cy.layout(CY_LAYOUT).run();
    window.cy.center();
}

function toggleMap() {
    console.log("TOGGLE");
    if (!window.cyMap) {
        enableMap()
    } else {
        disableMap()
    }
}

function disableMap() {
    if (window.cyMap) {
        window.cyMap.destroy();
        window.cyMap = undefined;
    }
    // cy.panzoom();
}

function enableMap() {
    cy.container().setAttribute("id", "graph");

    // cy.panzoom('destroy');

    const cyMap = cy.L({
        minZoom: 0,
        maxZoom: 18,
    }, {
        getPosition: (node) => {
            const lng = node.data('lng');
            const lat = node.data('lat');
            return typeof lng === "number" && typeof lat === "number"
                ? { lat, lng }
                : null;
        },
        setPosition: (node, lngLat) => {
            if(typeof node.data('lon') === "number" && typeof node.data('lat') === "number") {
                node.data('lng', lngLat.lng);
                node.data('lat', lngLat.lat);
            } else {
                node.scratch('leaflet', lngLat);
            }
        },
        animate: true,
        animationDuration: 500,
        // hideNonPositional: true,
        delayOnMove: 50,
        runLayoutOnViewport: false,
    });

    window.cyMap = cyMap;
    L.tileLayer('//{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        minZoom: 0,
        maxZoom: 18,
    }).addTo(window.cyMap.map);
}

function displayElementInfobox(data) {
    const infobox = $('#info-box');
    const dl = $('<dl class="row"></dl>');

    const attributes_list = Object.keys(ATTRIBUTES_TEXT);

    infobox.append(dl)
    for (const [key, value] of Object.entries(data)) {
        // <dt className="col-sm-3">Description lists</dt>
        // <dd className="col-sm-9">A description list is perfect for defining terms.</dd>
        if(attributes_list.includes(key)) {
            dl.append($("<dt></dt>").addClass("col-sm-3").text(ATTRIBUTES_TEXT[key]));
            dl.append($("<dd></dd>").addClass("col-sm-9").text(value));
        }
    }
}


function clearElementInfobox() {
    $("#info-box").empty();
}
