var width = 960;
var height = 500;

var map = L.map('map').setView([51.508070, -0.126432], 16);
mapLink = L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

var svgLayer = L.svg().addTo(map);
// d3.select('#map')
//     .attr("width",width)
//     .attr("height",height);

var graph = { nodes : [
        {id: "New York", lat: 40.706109,lon:-74.01194, color: "ff0000"},
        {id: "London", lat: 51.508070, lon: -0.126432,  color: "ff0000" },
        {id: "Montevideo", lat: -34.901776, lon: -56.163983,  color: "ff0000" },
        {id: "London-NewYork1" },
        {id: "London-NewYork2" },
        {id: "London-NewYork3" },
        {id: "Montevideo-London"}
    ],
    links : [
        { source: "New York", target: "London-NewYork1" },
        { source: "New York", target: "London-NewYork2" },
        { source: "New York", target: "London-NewYork3" },
        { source: "London-NewYork1", target: "London" },
        { source: "London-NewYork2", target: "London" },
        { source: "London-NewYork3", target: "London" }	,
        { source: "London", target: "Montevideo-London" },
        { source: "Montevideo-London", target: "Montevideo" }
    ]
}


var force = d3.forceSimulation()
    .force("link", d3.forceLink()
        .id(function(d){
            return d.id;
        })
        .distance(10))
    .force("charge", d3.forceManyBody().strength(-200));


// var svg = d3.select("body")
//     .append("svg")
//     .attr("width",width)
//     .attr("height",height);

// var projection = d3.geoMercator()
//     .center([0,10])
//     .translate([width/2,height/2]);

// var path = d3.geoPath().projection(projection);

var svg = d3.select("#map").select("svg");
var g = svg.select('g');

// var g = document.createElementNS("http://www.w3.org/2000/svg", "g");

var links = svg.append('g')
    .selectAll("line")
    .data(graph.links)
    .enter()
    .append("line")
    .attr("stroke-width", 2)
    .attr("stroke", "black");


var nodes = svg.append('g')
    .selectAll("circle")
    .data(graph.nodes)
    .enter()
    .append("circle")
    .attr('r',5)
    .attr("class", "leaflet-interactive")
    .attr("style", "pointer-events: auto;")
    .on("mouseenter", function(){ map.dragging.disable(); })
    .on("mouseout", function(){map.dragging.enable();})
    .style("cursor", "pointer")
    .call(d3.drag()
        .on("start", dragInicia)
        .on("drag", dragging)
        .on("end", dragTermina));


force.nodes(graph.nodes);
force.force("link").links(graph.links);

// graph.nodes.forEach(function(d) {
//     if(d.lon && d.lat) {
//         var p = projection([d.lon,d.lat]);
//         d.fx = p[0];
//         d.fy = p[1];
//     }
// })

drawAndUpdateCircles();
map.on("moveend", drawAndUpdateCircles);

//simulación y actualizacion de la posicion de los nodos en cada "tick"
force.on("tick", function (){
    links
        .attr('x1', function(d){
            return d.source.x;
        })
        .attr('y1', function(d){
            return d.source.y;
        })
        .attr('x2', function(d){
            return d.target.x;
        })
        .attr('y2', function(d){
            return d.target.y;
        })
    ;

    nodes
        .attr('cx', function(d){
            return d.x;
        })
        .attr('cy', function(d){
            return d.y;
        })
    ;
})


function dragInicia(d){
    if (!d.lon || !d.lat) {
        if (!d3.event.active) force.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
    }
}

function dragging(d){
    if (!d.lon || !d.lat) {
        d.fx = d3.event.x;
        d.fy = d3.event.y;
    }
}

function dragTermina(d){
    if (!d.lon ||!d.lat) {
        if(!d3.event.active) force.alphaTarget(0);
        d.fx = null;
        d.fy = null;
    }
}

function drawAndUpdateCircles() {
    //si tiene lon y lat clavelos al punto en el mapa
    //gracias a Andrew Reid (user:7106086 en stackoverflow)
    graph.nodes.forEach(function(d) {
        if(d.lon && d.lat) {
            p = new L.LatLng(d.lat, d.lon);
            var layerPoint = map.latLngToLayerPoint(p);
            d.fx = layerPoint.x;
            d.fy = layerPoint.y;
        }
    })

    // reinicie la simulación para que los puntos puedan quedar en donde son si se hace zoom o drag
    force
        .alpha(1)
        .restart();
}
