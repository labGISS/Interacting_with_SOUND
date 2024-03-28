/** Get 3d graph data from server parse them
 * Return a promise with parsed data
 * @param units units filter
 */
function load3dData(units) {
    return new Promise(function (resolve, reject) {
        get3DGraph(units, data => {
            let nodes = {}
            let links = data.map(r => {
                const source = r[0];
                nodes[source.id] = source;
                const target = r[1];
                nodes[target.id] = target;
                const rel = r[2];
                return Object.assign({source: source.id, target: target.id}, rel); // riformatta i record
            });

            // cross-link node objects
            links.forEach(link => {
                const a = nodes[link.source];
                const b = nodes[link.target];
                !a.neighbors && (a.neighbors = []);
                !b.neighbors && (b.neighbors = []);
                a.neighbors.push(b);
                b.neighbors.push(a);

                !a.links && (a.links = []);
                !b.links && (b.links = []);
                a.links.push(link);
                b.links.push(link);
            });

            resolve({nodes: Object.values(nodes), links: links}) // dei nodi prendere solo i valori non gli indici
        });
    });
}

function loadSllData() {
    return new Promise(resolve => {
        getSLLMapData((data) => {
            resolve(data);
        });
    });

}


function startLoading(unitsFilter) {
    const graphPromise = load3dData(unitsFilter);
    const sllPromise = loadSllData();

    const loadingBtn = document.querySelector('#aziendeFilterForm button[type=submit]');
    const loadingSpinnerElements = loadingBtn.querySelectorAll('.on-loading');
    const filterText = loadingBtn.querySelector('.loading-complete');

    loadingSpinnerElements.forEach(el=> el.classList.remove('visually-hidden'));
    filterText.classList.add('visually-hidden');
    loadingBtn.setAttribute('disabled', "");

    Promise.all([graphPromise, sllPromise]).then(([graphData, sllData]) => {
        Grafo(graphData);
        loadMap(sllData, graphData);

        loadingSpinnerElements.forEach(el=> el.classList.add('visually-hidden'));
        filterText.classList.remove('visually-hidden');
        loadingBtn.removeAttribute('disabled');

    });
}

function Grafo(gData) {
    const highlightNodes = new Set();
    const highlightLinks = new Set();
    let hoverNode = null;

    // link evidenzia
    function updateHighlight() {
        // trigger update of highlighted objects in scene
        graph
            .nodeColor(graph.nodeColor())
            .linkWidth(graph.linkWidth())
            .linkDirectionalParticles(graph.linkDirectionalParticles());
    }
    // fine Link Evidenzia
    const elem = document.getElementById('3d-graph');
    const elemXl = document.getElementById('3d-graph-xl');

    let graph = window.graph = ForceGraph3D()(elem);
    graph
        .graphData(gData)
        .nodeAutoColorBy('label')
        .nodeVal('size')
        .linkAutoColorBy('type')
        //.linkWidth('weight')
        .nodeLabel(node => `${node.label}: ${node.caption}`)
        .onNodeHover(node => elem.style.cursor = node ? 'pointer' : null)
        .onNodeDragEnd(node => {
            node.fx = node.x;
            node.fy = node.y;
            node.fz = node.z;
        })
        .linkThreeObjectExtend(true)
        .linkThreeObject(link => {
            // extend link with text sprite
            const sprite = new SpriteText(`${link.imprese}`);
            sprite.color = 'lightgrey';
            sprite.textHeight = 1.5;
            return sprite;
        })
        .linkPositionUpdate((sprite, { start, end }) => {
            const middlePos = Object.assign(...['x', 'y', 'z'].map(c => ({
                [c]: start[c] + (end[c] - start[c]) / 2 // calc middle point
            })))
            Object.assign(sprite.position, middlePos)
        })
        .onNodeClick(node => {
            // Aim at node from outside it
            if (node.description) {
                $("#details").text(`${node.label}: ${node.caption}. ${node.description}`);
            } else {
                $("#details").text(`${node.label}: ${node.caption}`);
            }
            const distance = 150 ;
            const distRatio = 1 + distance/Math.hypot(node.x, node.y, node.z);
            graph.cameraPosition(
                { x: node.x * distRatio, y: node.y * distRatio, z: node.z * distRatio }, // new position
                node, // lookAt ({ x, y, z })
                3000  // ms transition duration
            );

            window.map.flyTo(L.latLng(node),10);
            var popup = L.popup()
                .setLatLng(L.latLng(node))
                .setContent(String(node.caption))
                .openOn(window.map);
        })
        .onNodeRightClick(node =>{
            node.color="#00FF00"
        })
        //.nodeColor(node => highlightNodes.has(node) ? node === hoverNode ? 'rgb(255,0,0,1)' : 'rgba(255,160,0,0.8)' : 'rgba(0,255,255,0.6)')

        .linkWidth(link => highlightLinks.has(link) ? 4 : link['weight'])
        .linkDirectionalParticles(link => highlightLinks.has(link) ? 4 : 0)
        .linkDirectionalParticleWidth(4)
        .onNodeHover(node => {
            // no state change
            if ((!node && !highlightNodes.size) || (node && hoverNode === node)) return;

            highlightNodes.clear();
            highlightLinks.clear();
            if (node) {
                highlightNodes.add(node);
                node.neighbors.forEach(neighbor => highlightNodes.add(neighbor));
                node.links.forEach(link => highlightLinks.add(link));
            }

            hoverNode = node || null;
            updateHighlight();
        })

        .onLinkHover(link => {
            highlightNodes.clear();
            highlightLinks.clear();

            if (link) {
                highlightLinks.add(link);
                highlightNodes.add(link.source);
                highlightNodes.add(link.target);
            }
            updateHighlight();
        });

    graph.d3Force('charge').strength(-200);
    graph.width(window.innerWidth/2);
    graph.height(document.querySelector('.display-container').clientHeight)
}

function loadMap(sllData, gData) {
    const layerDefaultStyle = {
        color: '#a34662',
        opacity: 1,
        fillColor:'#0000f0',
        fillOpacity:0.3,
        weight: 1,
        className: 'no-cursor',
    };

    const pointDefaultStyle = {
        color: '#773248',
        fillColor: '#773248',
        fillOpacity: 1,
        radius: 2000
    };

    const nodes = gData.nodes;
    const lc = {};

    if (window.map) {
        window.map.remove();
        window.map = undefined;
    }

    const mymap = window.map = L.map('mapid', {
        zoomAnimation: true,
    }).setView([39.309993, 16.250193], 8);

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 30,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(mymap);

    function onEachFeature(feature, layer) {
        // does this feature have a property named SLL_2011?
        if (feature.properties && feature.properties.SLL_2011) {
            layer.bindPopup(String(feature.properties.SLL_2011));
        }

        layer.on('mouseover', e => {
            layer.setStyle({
                // weight: 2
            });
        })

        layer.on('mouseout', e => {
            layer.setStyle(layerDefaultStyle);
        });
    }

    const nodes_ids = nodes.map(el => el.id);

    let gl = L.geoJSON(sllData, {
        style: layerDefaultStyle,
        filter: function(feature, layer) {
            return nodes_ids.includes(feature.properties.SLL_2011);
        },
        onEachFeature: onEachFeature
    }).addTo(map);


    for (const [k , element] of Object.entries(nodes)) {
        // element[0] = source
        // element[1] = target
        // element[2] = link

        if (element.hasOwnProperty('lat') && element.hasOwnProperty('lng')) {
            const ll = L.latLng(element.lat,element.lng);
            lc[element.id] = L.circle(ll, pointDefaultStyle).addTo(mymap);

            lc[element.id].on('click', onMarkerClick)
            lc[element.id].on('mouseover', (e) => {
                const layer = e.sourceTarget;
                layer.setRadius(3000);

                // highlight also the layer
                const sllLayer = gl.getLayers().find((l) => {
                    return l.feature.properties.SLL_2011 === element.id;
                }).setStyle({
                    weight: 2
                });
            });

            lc[element.id].on('mouseout', (e) => {
                const layer = e.sourceTarget;
                layer.setRadius(pointDefaultStyle.radius);

                // remove highlight also to the layer
                const sllLayer = gl.getLayers().find((l) => {
                    return l.feature.properties.SLL_2011 === element.id;
                }).setStyle(layerDefaultStyle);
            });
        }

        // L.marker(ll)
        // .on('click', onMarkerClick)
        // .addTo(mymap);
    }

    function onMarkerClick(e){
        let nod={};
        window.map.setZoom(8);
        for (const [k , element] of Object.entries(nodes)){
            if (element.label === 'Sll') {
                const ll = L.latLng(element.lat,element.lng);
                if ( ll.equals(e.latlng)) {
                    nod = element;
                }
            }
        }
        const distance = 150;
        const distRatio = 1 + distance/Math.hypot(nod.x, nod.y, nod.z);
        window.graph.cameraPosition(
            { x: nod.x * distRatio, y: nod.y * distRatio, z: nod.z * distRatio }, // new position
            nod, // lookAt ({ x, y, z })
            3000  // ms transition duration
        );
    }
}

const form = document.querySelector("#aziendeFilterForm");
form.addEventListener('submit', (evt) => {
    evt.preventDefault();
    const units = document.querySelector('#aziendeFilterInput').value;
    startLoading(units);
});

$("#spinner").hide()
