// Links
var quakeLink = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_month.geojson";
var platesLink = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_plates.json";

// Defining the color palette
var colorList = ['#1BC04C', '#B1ED8B', '#FFFF00', '#FF7A04', '#F35C1B', '#FF0000']

// Pulling and Displaying data
d3.json(quakeLink, function(data) {

    // Empty Markers
    let markers = [];

    // Loop for markers
    for (var i = 0; i < data.features.length; i++) {
        let x = data.features[i].geometry.coordinates[0]
        let y = data.features[i].geometry.coordinates[1]
        let size = data.features[i].properties.mag
        let color = null;
        let fill = null;

        // Color logic block
        if (size < 1) { color, fill = colorList[0];} 
        else if (size <= 2) { color, fill = colorList[1];} 
        else if (size <= 3) { color, fill = colorList[2];} 
        else if (size <= 4) { color, fill = colorList[3];} 
        else if (size <= 5) { color, fill = colorList[4];} 
        else if (size > 5) { color, fill = colorList[5];}

        // Defining size
        let marker = L.circleMarker([y, x], {radius : size*1.5, color : color, fillColor : fill, fillOpacity: 0.9})
        
        // Pushing each marker out
        markers.push(marker)
    };

    // Baked in Tech Plates function
    d3.json(platesLink, function(response) {

        // Defining layers
        var dataLayer = L.geoJson(response)
        var markerLayer = L.featureGroup(markers)
        var overlayMaps = {
            "Tect Plates": dataLayer,
            "Quakes": markerLayer
        };

        // Access and layers
        let mapboxUrl = 'https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}';
        let accessToken = 'pk.eyJ1IjoiZmxhdzEzMzEiLCJhIjoiY2pmeDVhNXVlMDFxczJxdGxyNXp5Mjh4aSJ9.lUaWaK2BUWrzrr2uDR303Q';
        let myLayer = L.tileLayer(mapboxUrl, {id: 'mapbox.streets-satellite', maxZoom: 20, accessToken: accessToken});
        let light = L.tileLayer(mapboxUrl, {id: 'mapbox.streets', maxZoom: 20, accessToken: accessToken});
        let dark = L.tileLayer(mapboxUrl, {id: 'mapbox.dark', maxZoom: 20, accessToken: accessToken});

        var baseMaps = {
            "Street Map": myLayer,
            "Light Map": light,
            "Dark Map": dark
        };

        var map = L.map("map", {
            center: [50, -100],
            zoom: 4,
            layers: [myLayer, light, dark]
        });

        L.control.layers(baseMaps,overlayMaps).addTo(map);

        var legend = L.control({position: 'bottomright'});

        legend.onAdd = function (map) {

            var div = L.DomUtil.create('div', 'info legend');
            let limits = [1,2,3,4,5,6];
            let labels = ['0-1','1-2','2-3','3-4','4-5', '5+'];
            let labelPush = [];

            limits.forEach(function (limits, index) {
                labelPush.push('<li style="background-color: ' + colorList[index] + '"></li>        ' + labels[index] + '<br>')
            })

            var legendStructure = '<h1>Quake<br>Scale</h1>' +
                '<div class="labels">' +
                    '<ul class="colors">' + labelPush.join('') + '</ul>' +
                '</div>';

            div.innerHTML = legendStructure;

            return div;
        }
    legend.addTo(map)
    })
});
