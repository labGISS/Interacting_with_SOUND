function loadData(endpoint, parameters) {

    $.ajax({
        dataType: 'json',
        url: endpoint,
        type: "get", //send it through get method
        data: parameters,
        success: function(response) {
            loadMap(response)
        },
        error: function(xhr) {
            //Do Something to handle error
        }
    });

}

function loadMap(data) {
    const nodes = data.nodes;
    const rels = data.rels;

    const cyNodes = nodes.map((node) => {
        return {data: node}
    });

    const cyRels = rels.map((rel)=> {
       return {data: rel}
    });

    const elements = {
        nodes: cyNodes,
        edges: cyRels
    };

    console.log(elements);

    const colors = {
        'Sll': '#1f77b4',
        'Ateco': '#b41f53',
        'Exporting': '#fff600',
        'Emerging': '#66bd54'
    };

    const label_attr = {
        'Sll': 'name',
        'Ateco': 'code',
        'Exporting': 'name',
        'Emerging': 'name',
    };

    if (window.cy) {
        console.log("Destroying previous cytoscape instance");
        window.cy.destroy();
    }

    const cy = cytoscape({
        container: document.getElementById('graph'),
        elements,
        layout: {
            name: 'd3-force',
            animate: true,
            linkId: function id(d) {
                return d.id;
            },
            linkDistance: 10,
            manyBodyStrength: -300,
            randomize: false,
            infinite: true
        },
        style: [
            {
                selector: 'node',
                style: {
                    'width': 20,
                    'height': 20,
                    'border-color': '#ffffff',
                    'border-width': 1,
                    // 'background-color': '#1f77b4',
                    'background-color': function (node) {
                        return colors[node.data()['labels'][0]];
                    },
                    // 'background-image': 'data:image/svg+xml;utf8,' + encodeURIComponent(`<svg width="1792" height="1792" viewBox="0 0 1792 1792" xmlns="http://www.w3.org/2000/svg"><path d="M1216 0q185 0 316.5 93.5t131.5 226.5v896q0 130-125.5 222t-305.5 97l213 202q16 15 8 35t-30 20h-1056q-22 0-30-20t8-35l213-202q-180-5-305.5-97t-125.5-222v-896q0-133 131.5-226.5t316.5-93.5h640zm-320 1344q80 0 136-56t56-136-56-136-136-56-136 56-56 136 56 136 136 56zm576-576v-512h-1152v512h1152z" fill="#fff"/></svg>`),
                    // 'background-width': '60%',
                    // 'background-height': '60%',
                    'color': '#333333',
                    'label': function(node) {
                        let data = node.data();
                        return data[label_attr[data['labels'][0]]]
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
                    'line-color': '#cccccc',
                    'width': 1
                }
            },
            {
                selector: 'edge.hover',
                style: {
                    'line-color': '#999999'
                }
            },
        ]
    });

    window.cy = cy;

    // cy.panzoom();
    // cy.lassoSelectionEnabled(true);

    cy.on('mouseover', '*', e => {
        e.target.addClass('hover');
        e.cy.container().style.cursor = 'pointer';
    });
    cy.on('mouseout', '*', e => {
        e.target.removeClass('hover');
        e.cy.container().style.cursor = 'default';
    });

    let cyMap = false;
    const toggleMap = () => {
        console.log("TOGGLE");
        if (!cyMap) {
            cy.container().setAttribute("id", "graph");

            // cy.panzoom('destroy');

            cyMap = cy.L({
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
            }).addTo(cyMap.map);
            // cyMap.map.setView(new L.LatLng(39.497934628621884, 16.38500133250716), 10);
        } else {
            cyMap.destroy();
            cyMap = undefined;

            // cy.panzoom();
        }
    };
    document.getElementById('mode').addEventListener('click', toggleMap);
    // cy.ready(() => toggleMap());

    // cy.ready(() => toggleMap());
    //
    // const minLng = cy.nodes().reduce((acc, node) => Math.min(acc, node.data('lng') || acc), Infinity);
    // const maxLng = cy.nodes().reduce((acc, node) => Math.max(acc, node.data('lng') || acc), -Infinity);
    // const minLat = cy.nodes().reduce((acc, node) => Math.min(acc, node.data('lat') || acc), Infinity);
    // const maxLat = cy.nodes().reduce((acc, node) => Math.max(acc, node.data('lat') || acc), -Infinity);
    // const minX = cy.nodes().reduce((acc, node) => Math.min(acc, node.position('x')), Infinity);
    // const maxX = cy.nodes().reduce((acc, node) => Math.max(acc, node.position('x')), -Infinity);
    // const minY = cy.nodes().reduce((acc, node) => Math.min(acc, node.position('y')), Infinity);
    // const maxY = cy.nodes().reduce((acc, node) => Math.max(acc, node.position('y')), -Infinity);
    // const addNode = () => {
    //     const randomId = Math.floor(Math.random() * 10e12).toString(36);
    //     const randomLng = minLng + Math.random() * (maxLng - minLng);
    //     const randomLat = minLat + Math.random() * (maxLat - minLat);
    //     const randomX = minX + Math.random() * (maxX - minX);
    //     const randomY = minY + Math.random() * (maxY - minY);
    //
    //     cy.add({
    //         group: 'nodes',
    //         data: { id: randomId, lng: randomLng, lat: randomLat },
    //         position: { x: randomX, y: randomY }
    //     });
    //     cy.add({
    //         group: 'edges',
    //         data: { source: randomId, target: 'Makov' }
    //     });
    // };
    // // document.getElementById('add-node').addEventListener('click', addNode);
    //
    // const resetView = () => {
        //     if (!cyMap) {
        //         cy.fit(undefined, 50);
        //     } else {
        //         cyMap.fit(undefined, { padding: [50, 50] });
        //     }
        // };
        // // document.getElementById('reset-view').addEventListener('click', resetView);
}
