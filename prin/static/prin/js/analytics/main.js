const NODE_COLORS = {
    'Sll': '#118ab2',
    'Ateco': '#ef476f',
    'Exporting': '#ffd166',
    'Emerging': '#06d6a0'
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
    "ncom": "#Comuni",
    "population": "Popoloazione",
    "area": "Area",
    "lat": "Latitudine",
    "lng": "Longitudine",
    "year": "Anno",
    "cluster": "Cluster",
    "units": "#Aziende",
    "employee_avg": "Impiegati",
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
            'background-color': function (node) {
                return NODE_COLORS[node.data()['labels'][0]];
            },
            'color': '#333333',
            'label': function (node) {
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
            'border-color': '#a34662',
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
        selector: '.highlighted',
        style: {
            "z-index": "999999"
        }
    },
    {
        selector: 'node.highlighted',
        style: {
            "border-color": '#a34662',
            "color": "#a34662",
        }
    },
    {
        selector: 'edge.highlighted',
        style: {
            "line-color": '#a34662',
            "width": 1
        }
    },
    {
        selector: 'node.unselected',
        style: {
            "opacity": 0.5
        }
    },
];

const CY_CHARGE_FORCE = {
    'Sll': -500,
    'Ateco': -300,
    'Exporting': -500,
    'Emerging': -500,
};

const CY_DEFAULT_LAYOUT = {
    name: 'd3-force',
    animate: true,
    maxSimulationTime: 3000,
    fixedAfterDragging: false,
    linkId: function id(d) {
        return d.id;
    },
    linkDistance: 100,
    manyBodyStrength: function (node) {
        return CY_CHARGE_FORCE[node['labels'][0]];
    },
    randomize: false,
    infinite: true,
}

const CY_MAP_LAYOUT = {
    name: 'd3-force',
    animate: true,
    maxSimulationTime: 3000,
    fixedAfterDragging: true,
    linkId: function id(d) {
        return d.id;
    },
    linkDistance: 100,
    manyBodyStrength: function (node) {
        return CY_CHARGE_FORCE[node['labels'][0]];
    },
    xX: 150,
    yY: 150,
    xStrength: 1,
    yStrength: 0.5,
    randomize: false,
    infinite: true,
};

const yearsSlider = document.getElementById('slider');
const yearRangeMin = parseInt(yearsSlider.getAttribute('data-range-min')),
    yearRangeMax = parseInt(yearsSlider.getAttribute('data-range-max'));

// update application state
function updateURL(param, value) {
    pushSearchParametersString(updateLocationSearchParams(param, value));
}

// Cytoscape
function initCy() {
    const cy = window.cy = cytoscape({
        container: document.getElementById('graph'),
        style: CY_STYLE,
        zoom: 1.0,
        minZoom: 0.7,
        maxZoom: 2.5,
        // layout: CY_DEFAULT_LAYOUT,
    });

    // cy.panzoom();

    cy.on('mouseover', '*', e => {
        e.target.addClass('hover');
        e.cy.container().style.cursor = 'pointer';
    });
    cy.on('mouseout', '*', e => {
        e.target.removeClass('hover');
        e.cy.container().style.cursor = 'default';
    });

    cy.on('select', 'node', function (evt) {
        const targetNode = evt.target;

        // TODO: Better handling selection of all paths from a cluster to the related slls
        if (targetNode.data()['labels'][0] === "Emerging" || targetNode.data()['labels'][0] === "Exporting") {
            targetNode.neighborhood().forEach((atecos) => {
                atecos.addClass('highlighted');
                if (atecos.isNode()) { // ateco
                    atecos.neighborhood(`edge[cluster = '${targetNode.data()['name']}']`).forEach((sllEdges) => {
                        sllEdges.addClass('highlighted');
                        sllEdges.target().addClass('highlighted');
                    })
                }
            });
        } else {
            targetNode.neighborhood().addClass("highlighted");
        }
        displayElementInfobox(evt.target.data())
    });

    cy.on('select', 'edge', function (evt) {
        evt.target.addClass("highlighted");
        evt.target.source().addClass("highlighted");
        evt.target.target().addClass("highlighted");
        displayElementInfobox(evt.target.data())
    });

    cy.on('unselect', '*', function (evt) {
        evt.target.removeClass("highlighted");
        // evt.target.neighborhood().removeClass("highlighted");
        evt.cy.elements().removeClass("highlighted");
        clearElementInfobox()
    });
}

function runLayout(layoutOptions) {
    if (window.currentLayout) {
        window.currentLayout.stop();
    }

    window.currentLayout = window.cy.layout(layoutOptions);
    window.currentLayout.run();

    return window.currentLayout;
}

function loadGraph(data) {
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

    if(window.cyMap) {
        runLayout(CY_MAP_LAYOUT);
    } else {
        runLayout(CY_DEFAULT_LAYOUT).once('layoutstop', () => loading(false));
        // window.currentLayout = window.cy.layout(CY_DEFAULT_LAYOUT)/*.once('layoutstop', () => loading(false))*/.run();
    }
}
function toggleMap() {
    const mapBtn = document.querySelector('#toggleMapBtn');

    if (!window.cyMap) {
        enableMap();
        mapBtn.classList.remove('btn-outline-red');
        mapBtn.classList.add('btn-red');
    } else {
        disableMap();
        mapBtn.classList.remove('btn-red');
        mapBtn.classList.add('btn-outline-red');
    }
}

function enableMap() {
    if (window.cyMap) {
        return;
    }
    window.cy.container().setAttribute("id", "graph");
    // window.cy.panzoom('destroy');

    runLayout(CY_MAP_LAYOUT);

    const cyMap = window.cyMap = window.cy.L({
        minZoom: 0,
        maxZoom: 12,
    }, {
        getPosition: (node) => {
            const lng = node.data('lng');
            const lat = node.data('lat');
            return typeof lng === "number" && typeof lat === "number"
                ? {lat, lng}
                : null;
        },
        // setPosition: (node, lngLat) => {
        //     if (typeof node.data('lon') === "number" && typeof node.data('lat') === "number") {
        //         node.data('lng', lngLat.lng);
        //         node.data('lat', lngLat.lat);
        //     } else {
        //         node.scratch('leaflet', lngLat);
        //     }
        // },
        animate: true,
        animationDuration: 500,
    });

    L.tileLayer('//{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        minZoom: 0,
        maxZoom: 18,
    }).addTo(cyMap.map);
}

function disableMap() {
    if (window.cyMap) {
        window.cyMap.destroy();
        window.cyMap = undefined;
        // window.cy.panzoom();
    }

    runLayout(CY_DEFAULT_LAYOUT);
}

function myFunction() {
    document.getElementById("myDropdown").classList.toggle("show");
}

function filterFunction() {
    let input, filter, ul, li, a, i;
    input = document.getElementById("myInput");
    filter = input.value.toUpperCase();
    div = document.getElementById("myDropdown");
    a = div.getElementsByTagName("a");
    for (i = 0; i < a.length; i++) {
        txtValue = a[i].textContent || a[i].innerText;
        if (txtValue.toUpperCase().indexOf(filter) > -1) {
            a[i].style.display = "";
        } else {
            a[i].style.display = "none";
        }
    }
}

// initialization
/**
 * Disable all grap controls
 */
function resetControls() {
    $("#select-SLL").empty().prop('disabled', true);
    $("#buttonCluster").prop('disabled', true);
    $(".anchorCluster").addClass('disabled');
    $("#dati-download").prop('disabled', true);
    $("#mappa-download").prop('disabled', true);

    window.yearsSlider.noUiSlider.reset(false);
}

function disableControls(disabled) {
    $("#select-SLL").prop('disabled', disabled);
    $("#buttonCluster").prop('disabled', disabled);
    $("#dati-download").prop('disabled', disabled);
    $("#mappa-download").prop('disabled', disabled);

    if(disabled) {
        $(".anchorCluster").addClass('disabled');
        window.yearsSlider.noUiSlider.disable();
    } else {
        $(".anchorCluster").removeClass('disabled');
        window.yearsSlider.noUiSlider.enable();
    }
}

function resetGraph() {
    window.cy.elements().unselect()
    window.cy.elements().remove();
}

function resetURL() {
    Object.keys(window.currentState).forEach((param) => updateURL(param, undefined));
}

/**
 * Reset all requested elements: clear the state, reset the controls, clear the graph
 */
function resetAll(state = true, controls = true, graph = true, URL = false) {
    if (state) {
        window.currentState = {
            reg: undefined,
            sll: undefined,
            cluster: undefined,
            year: undefined
        }
    }

    controls && resetControls();
    graph && resetGraph();
    URL && resetURL();

}

function loading(isLoading) {
    disableControls(isLoading);
    if (isLoading) {
        document.querySelector('.cytoscape-screen .loading-overlay').classList.add('active');
    } else {
        document.querySelector('.cytoscape-screen .loading-overlay').classList.remove('active');
    }
}
function initPage() {
    // initialize global state
    resetAll(true, false, false);

    initCy();

    window.history.onreplacestate = function (state) {
        const params = new window.URLSearchParams(window.location.search);
        loadQueryParameters(Object.fromEntries(params));
    }

    const params = new window.URLSearchParams(window.location.search);
    loadQueryParameters(Object.fromEntries(params));

    bsEnableTooltips();
}

function loadQueryParameters(parameters) {
    const reg = parameters.reg;
    const sll = parameters.sll;
    const year = parameters.year || yearRangeMax;
    const cluster = parameters.cluster;

    console.log(reg, sll, year, cluster);

    if (year) {
        // set the years slider to the correct value
        window.yearsSlider.noUiSlider.set(year, false);
    }

    if (!reg) {
        return;
    }

    if (year !== window.currentState.year || reg !== window.currentState.reg) {
        const showOnGraph = (window.cy.elements().empty() || year !== window.currentState.year) && !cluster;
        changeRegione(reg, year, !cluster); // load slls on graph only if neither cluster nor sll is selected
    }

    if (cluster && (year !== window.currentState.year || cluster !== window.currentState.cluster)) {
        changeCluster(cluster, year)
    }


    selectSLL(sll);
}

function changeCluster(clusterName, year) {
    // window.cy.elements().unselect();
    // // $("#select-SLL").val('');
    // // $("#select-SLL").prop('disabled', true);
    // window.cy.elements().remove();
    resetAll(false, false, true);
    loading(true);
    getGraph(clusterName, year, function (data) {
        loadGraph(data);
        loading(false);
    });
    window.currentState.cluster = clusterName;
    window.currentState.year = year;

    // set the years slider to the correct value
    window.yearsSlider.noUiSlider.set(year, false);
}

function displayElementInfobox(data) {
    const infobox = $('#info-box');
    const dl = $('<dl class="row"></dl>');

    const attributes_list = Object.keys(ATTRIBUTES_TEXT);

    infobox.append(dl)
    for (var [key, value] of Object.entries(data)) {
        if (attributes_list.includes(key)) {
            dl.append($("<dt></dt>").addClass("col-sm-5").text(ATTRIBUTES_TEXT[key]));
            if (typeof value === "number") {
                if (!Number.isInteger(value)) {
                    value = Number(value).toFixed(2);
                }
            }
            dl.append($("<dd></dd>").addClass("col-sm-7").text(value));
        }
    }
}

function clearElementInfobox() {
    $("#info-box").empty();
}


function dropdown() {
    var x = document.getElementById("drop-menu");
    var setting = x.style.display;
    if (setting == "none") {
        x.style.display = "block";
    } else {
        x.style.display = "none";
    }
}


function changeRegione(reg, year, loadOnGraph = true) {
    console.log("Change regione", reg, loadOnGraph);
    const regDropdownOption = $(`#select-Regione > option[value="${reg}"]`);
    const sllDropdown = $("#select-SLL");

    if (regDropdownOption.length === 0) {
        // no region found
        return;
    }

    // each time we change the region, we reset the page
    resetAll();

    // select the dropdown option
    $(`#select-Regione > option[value=""]`).prop("selected", false);
    regDropdownOption.prop('selected', true);

    // set the years slider to the correct value
    window.yearsSlider.noUiSlider.set(year, false);

    // update the current state
    window.currentState.reg = reg;
    window.currentState.year = year;

    loading(true);
    getSLL(reg, function (data) {
        const slls = data.nodes;

        sllDropdown.empty();
        if (slls.length > 0) {
            sllDropdown.append(`<option value="">Seleziona un'Area Metropolitana/SLL</option>`);
        }
        for (const sll of slls) {
            sllDropdown.append(`<option value="${sll.code}">${sll.name}</option>`);
        }

        if (slls.length > 0) {
            $("#dati-download").prop('disabled', false);
            $("#mappa-download").prop('disabled', false);
            sllDropdown.prop('disabled', false);
            $("#buttonCluster").prop('disabled', false);
            $(".anchorCluster").removeClass('disabled');
        }

        if (loadOnGraph) {
            window.cy.elements().unselect();
            window.cy.elements().remove();
            loadGraph(data);
        }

        loading(false);
    });
}

function selectSLL(sllCode) {
    const sllDropdownOption = $(`#select-SLL > option[value="${sllCode}"]`);
    $(`#select-SLL > option[value=""]`).prop("selected", false);
    sllDropdownOption.prop('selected', true);

    window.cy.elements().unselect();

    window.currentState.sll = sllCode;
    window.cy.elements(`node[code="${sllCode}"]`).select();
}

function evidenziaNodi(TipoNodo) {
    if (window.cy.elements(`node[labels.0 = "${TipoNodo}"]`).hasClass("selected")) {
        // reset the visualization if the user click again on a node type already selected
        window.cy.elements().removeClass("unselected").removeClass("selected");
    } else {
        window.cy.elements(`node[labels.0 != "${TipoNodo}"]`).addClass("unselected");
        window.cy.elements(`node[labels.0 = "${TipoNodo}"]`).removeClass("unselected").addClass("selected");
    }
}

function downloadDati() {

    var dati = window.cy.elements().map(function (node) {
        return node.data();
    });

    var json = JSON.stringify(dati);

    json = [json];
    var blob1 = new Blob(json, {type: "text/plain;charset=utf-8"});

    var isIE = false
    !!document.documentMode;
    if (isIE) {
        window.navigator.msSaveBlob(blob1, "Dati.json");
    } else {
        var url = window.URL
        window.webkitURL;
        link = url.createObjectURL(blob1);
        var a = document.createElement("a");
        a.download = "Dati.json";
        a.href = link;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }
}


// state listeners
function onRegioneDropdown(newValue) {
    if (!newValue) {
        // if no region selected, reset all
        resetAll(true, true, true, true);
    }

    newValue = newValue === "" ? undefined : newValue;

    updateURL('sll', undefined);
    updateURL('cluster', undefined);

    updateURL('reg', newValue);
}

function onSllDropdown(newValue) {
    newValue = newValue === "" ? undefined : newValue;

    updateURL('sll', newValue);
}

function onYearSlider(values, handleIndex, unencoded, tap, positions, noUiSlider) {
    updateURL('year', unencoded[handleIndex]);
}

function onClusterClick(newValue) {
    updateURL('cluster', newValue);
}

function onResetButtonClick() {
    resetAll(true, true, true, true);

    const select = document.querySelector('#select-Regione');
    select.value = "";
    select.dispatchEvent(new Event('change'));
}


/* Slider  */
noUiSlider.create(yearsSlider, {
    start: [yearRangeMax],
    step: 1,
    range: {
        'min': yearRangeMin,
        'max': yearRangeMax
    },
    behaviour: 'smooth-steps-tap',
    // format: {
    //     to: value => Math.floor(value),
    //     from: value => parseInt(value)
    // },
    pips: {
        mode: 'steps',
        density: 3,
        filter: (value, type) => {
            // only for displayed numbers we change the display type
            if (type > 0) {
                // must return 1 to display large numbers, 2 to display small nubers
                return 1;
            }
            return 0;
        }
    }
});

yearsSlider.noUiSlider.on('set', onYearSlider);
window.yearsSlider = yearsSlider; // save the slider
