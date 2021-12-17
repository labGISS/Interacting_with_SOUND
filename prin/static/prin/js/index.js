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
    };

    const label_attr = {
        'Sll': 'name',
        'Ateco': 'code',
    };

    const cy = cytoscape({
        container: document.getElementById('graph'),
        elements,
        layout: {
            name: 'cose',
            animate: true,
            nodeRepulsion: 1000000
        },
        style: [
            {
                selector: 'node',
                style: {
                    'border-color': function (ele) {
                        const labels = ele.data('labels');
                        return colors[labels[0]]
                    },
                    'border-width': 2,
                    'background-color': '#ffffff',
                    // 'background-image': 'data:image/svg+xml;utf8,' + encodeURIComponent(`<svg width="1792" height="1792" viewBox="0 0 1792 1792" xmlns="http://www.w3.org/2000/svg"><path d="M1216 0q185 0 316.5 93.5t131.5 226.5v896q0 130-125.5 222t-305.5 97l213 202q16 15 8 35t-30 20h-1056q-22 0-30-20t8-35l213-202q-180-5-305.5-97t-125.5-222v-896q0-133 131.5-226.5t316.5-93.5h640zm-320 1344q80 0 136-56t56-136-56-136-136-56-136 56-56 136 56 136 136 56zm576-576v-512h-1152v512h1152z" fill="#fff"/></svg>`),
                    'background-width': '60%',
                    'background-height': '60%',
                    'color': '#333333',
                    'label': function (ele) {
                        const labels = ele.data('labels');
                        return ele.data(label_attr[labels[0]]);
                    },
                    'font-size': '10px',
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
                    'line-color': '#cccccc'
                }
            },
            {
                selector: 'edge.hover',
                style: {
                    'line-color': '#999999'
                }
            },
            {
                selector: '.eh-hover',
                style: {
                    'background-color': 'red'
                }
            },
        ]
    });
    cy.panzoom();
    cy.lassoSelectionEnabled(true);

    cy.on('mouseover', '*', e => {
        e.target.addClass('hover');
        e.cy.container().style.cursor = 'pointer';
    });
    cy.on('mouseout', '*', e => {
        e.target.removeClass('hover');
        e.cy.container().style.cursor = 'default';
    });

    let cyMap;
    let removeMap = true;
    const toggleMap = () => {
        removeMap = !removeMap;
        if (!removeMap) {
            cy.container().setAttribute("id", "graph");

            cy.panzoom('destroy');

            cy.autoungrabify(true);
            cyMap = cy.L(
                { // L.MapOptions (leaflet)
                    minZoom: 0,
                    maxZoom: 18,
                },
                { // MapOptions (cytoscape-leaflet)
                    getPosition: (node, map) => {
                        const lng = node.data('lng');
                        const lat = node.data('lat');

                        let toReturn = null;
                        if (typeof lng === "number" && typeof lat === "number") {
                            toReturn = { lat, lng }
                        } else {
                            // const renderedPosition = node.renderedPosition();
                            // const point = new L.Point(renderedPosition.x, renderedPosition.y);
                            // const latlng = map.containerPointToLatLng(point)
                            // console.log(latlng);
                            toReturn = null;
                        }
                        console.log(node.data(), toReturn);
                        return toReturn
                    },
                    animate: true,
                    animationDuration: 1000,
                });
            window.cyMap = cyMap;


            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            }).addTo(cyMap.map);
        } else {
            cyMap.destroy();
            cyMap = undefined;
            cy.autoungrabify(false);
            cy.panzoom();
        }
    };

    document.getElementById('mode').addEventListener('click', toggleMap);
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
