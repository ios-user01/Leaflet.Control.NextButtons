var layer = new L.tileLayer(
    'http://{s}.tile.cloudmade.com/63250e2ef1c24cc18761c70e76253f75/997/256/{z}/{x}/{y}.png'
);

var map = new L.Map('map', {
    layers: [layer],
    center: [37.7833, -122.4167],
    zoom: 13,
    zoomControl: true
});

var markerLayer = L.featureGroup().addTo(map);

L.marker([37.8044, -122.2708]).addTo(markerLayer);
L.marker([37.7833, -122.4167]).addTo(markerLayer);
L.marker([38.9208, -94.6222]).addTo(markerLayer);

var nextButtons = new L.control.nextButtons({
    markerLayer: markerLayer
}).addTo(map);
