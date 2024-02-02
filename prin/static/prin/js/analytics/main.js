const NODE_COLORS = {
    'Sll': '#03038c',
    'Ateco': '#bb0000',
    'Exporting': '#b4b400',
    'Emerging': '#008000'
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
    {
        selector: 'node.unselected',
        style: {
            "opacity": 0.5
        }
    },
];

function myFunction() {
    document.getElementById("myDropdown").classList.toggle("show");
}

function filterFunction() {
    var input, filter, ul, li, a, i;
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

function initPage() {
    const cy = cytoscape({
        container: document.getElementById('map'),
        style: CY_STYLE,
        zoom: 1.0,
        minZoom: 0.7,
        maxZoom: 2.5
    });
    cy.on('mouseover', '*', e => {
        e.target.addClass('hover');
        e.cy.container().style.cursor = 'pointer';
    });
    cy.on('mouseout', '*', e => {
        e.target.removeClass('hover');
        e.cy.container().style.cursor = 'default';
    });

    cy.on('select', 'node', function (evt) {
        evt.target.neighborhood().addClass("highlighted");
        displayElementInfobox(evt.target.data())
    });

    cy.on('select', 'edge', function (evt) {
        evt.target.addClass("highlighted");
        displayElementInfobox(evt.target.data())
    });

    cy.on('unselect', '*', function (evt) {
        evt.target.removeClass("highlighted");
        evt.target.neighborhood().removeClass("highlighted");
        clearElementInfobox()
    });
    window.cy = cy;

    getCluster(function (data) {
        var carouselElement = $('<div class="carousel-item border-end border-secondary active border-2"></div>');
        var carouselButton = $('<button type="button" data-bs-target="#carouselExampleDark" data-bs-slide-to="0" class="active" aria-current="true" aria-label="Slide 1"></button>');
        var counterButton = 1;
        var counterCluster = 1;
        var counter = 0;
        for (var cluster of data) {
            var iconName = "https://labgis.di.unisa.it/prin/static/prin/imgs/Exporting-Icons/" + cluster.name.replace(/,/gm, "").replace(/ /gm, "-") + ".png";
            carouselElement.append(`<div class="carousel-item-div">
                                        <a style="cursor: pointer" class="disabled anchorCluster" onclick="loadGraph('${cluster.name}')">
                                            <img src="${iconName}" style="width: 44px; margin-bottom: 4px;" title="${cluster.name}">
                                        </a>
                                    </div>`)
            $("#myDropdown").append(`<a class="clusterAnchor" onclick="loadGraph('${cluster.name}')" style="cursor: pointer">${cluster.name}</a>`);
            counter++;
            counterCluster++;
            if (counter > 7 || counterCluster > data.length) {
                $("#carouselCluster").append(carouselElement);
                carouselElement = $('<div class="carousel-item border-end border-secondary border-2"></div>');
                $("#carouselButton").append(carouselButton);
                carouselButton = $(`<button type="button" data-bs-target="#carouselExampleDark" data-bs-slide-to="${counterButton}" aria-label="Slide ${counterButton + 1}"></button>`);
                counter = 0;
                counterButton++;
            }
        }
        $(".carousel-control-next").removeClass("hidden");
    });
}

function loadGraph(clusterName) {
    window.cy.elements().unselect();
    $("#select-SLL").val('');
    $("#select-SLL").prop('disabled', true);
    window.cy.elements().remove();
    getGraph(clusterName, 2018, function (data) {
        uploadData(data);
    })
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

function addParam(url, param, value) {
    var parser = new URL(url);
    parser.searchParams.set(param, value);
    window.location.replace(parser.href);
    console.log(parser.href);
    return false;
}

function changeRegione(Regione) {
    console.log("Change regione", Regione);
    window.cy.elements().unselect();
    $("#select-SLL").empty();
    getSLL(Regione, function (data) {
        console.log(data);
        var slls = data.nodes;
        if (slls.length > 0) {
            $("#select-SLL").append(`<option>Seleziona un'Area Metropolitana/SLL</option>`);
        }
        for (var sll of slls) {
            $("#select-SLL").append(`<option value="${sll.id}">${sll.name}</option>`);
        }
        if (slls.length > 0) {
            $("#dati-download").prop('disabled', false);
            $("#mappa-download").prop('disabled', false);
            $("#select-SLL").prop('disabled', false);
            $("#buttonCluster").prop('disabled', false);
            $(".anchorCluster").removeClass('disabled');
        } else {
            window.cy.elements().remove();
        }
        uploadData(data);
    });

    $("#select-SLL").prop('disabled', true);
    $("#buttonCluster").prop('disabled', true);
    $(".anchorCluster").addClass('disabled');
    $("#dati-download").prop('disabled', true);
    $("#mappa-download").prop('disabled', true);

}

function selectSLL(idSLL) {
    window.cy.elements().unselect();
    window.cy.elements(`node[id="${idSLL}"]`).select();
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


/* Per Cytoscape */
function toggleMap() {
    if (!window.cyMap) {
        enableMap()
    } else {
        disableMap()
    }
}

function enableMap() {
    if (window.cyMap) {
        return;
    }
    cy.container().setAttribute("id", "map");

    // cy.panzoom('destroy');

    const cyMap = cy.L({
        minZoom: 0,
        maxZoom: 18,
    }, {
        getPosition: (node) => {
            const lng = node.data('lng');
            const lat = node.data('lat');
            return typeof lng === "number" && typeof lat === "number"
                ? {lat, lng}
                : null;
        },
        setPosition: (node, lngLat) => {
            if (typeof node.data('lon') === "number" && typeof node.data('lat') === "number") {
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

function disableMap() {
    if (window.cyMap) {
        window.cyMap.destroy();
        window.cyMap = undefined;
    }
    // cy.panzoom();
}


/* SLider Vincenzo */

(function ($, undefined) {

    // Defines the custom implementation of the built-in slider widget.
    $.widget("app.slider", $.ui.slider, {

        // The new "ticks" option defaults to false.
        options: {
            ticks: false
        },

        // Called when the slider is instantiated.
        _create: function () {

            // Call the orginal constructor, creating the slider normally.
            this._super();

            // If the "ticks" option is false or the "step" option is
            // less than 5, there's nothing to do.
            if (!this.options.ticks || this.options.step < 1) {
                return;
            }

            // Setup some variables for rendering the tick marks below the slider.
            var cnt = this.options.min,
                background = this.element.css("border-color"),
                left;

            var count = (this.options.max - this.options.min) / this.options.step;
            var iterator = 0;

            while (cnt <= this.options.max) {

                // Compute the "left" CSS property for the next tick mark.
                left = iterator * (100 / count)
                if (cnt === this.options.max) {
                    left = left - 0.2;
                }

                left = left.toFixed(2) + "%";

                // Creates the tick div, and adds it to the element. It adds the
                // "ui-slider-tick" class, which has common properties for each tick.
                // It also applies the computed CSS properties, "left" and "background".
                var tick = $("<div/>").addClass("ui-slider-tick")
                    .appendTo(this.element)
                    .css({left: left, background: background});


                /* Cambiare il controllo per i numeri */
                var number = $(`<div>${cnt}</div>`).css({
                    position: 'relative',
                    left: '-24px', /* -20px */
                    top: '20px', /* 20px */
                    'font-size': '17px',
                    'font-weight': 'bold',
                });
                tick.append(number);

                cnt += this.options.step;
                iterator++;
            }

        }

    });

    $(function () {

        $("#slider").slider({
            range: "min",
            value: 2019,
            min: 2011, /* 2011 */
            max: 2019, /* 2019 */
            step: 1,
            ticks: true,
        });

    });

})(jQuery);
