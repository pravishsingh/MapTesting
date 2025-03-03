
    var map = L.map('map').setView([28.37, 76.92], 13)// 13 is the zoom level if you want to zoom in or out you can change the number

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    // attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);



var scooterIcon = L.icon({
    iconUrl: 'makDriv.png', 
    iconSize: [200, 200],
    //iconAnchor: [30, 60],
    popupAnchor: [0, -60],
    className: 'scooter-icon'
});



var marker = L.marker([28.37, 76.92],{icon: scooterIcon}).addTo(map);
var marker1 = L.marker([28.50, 76.40]).addTo(map);

//  var circle = L.circle([28.37, 76.92], {
//      color: 'red',//    
//      fillOpacity: 0.5,
//    radius: 10000 // in meters
// }).addTo(map);



//  var polygon = L.polygon([
//      [28.37, 76.92],
//      [28.36, 76.91],
//      [28.33, 76.92]
//  ]).addTo(map);


 //marker.bindPopup("<b>Hello world!</b><br>I am a popup.").openPopup();
 marker1.bindPopup("<b>Outlet</b><br> popup.").openPopup();
// circle.bindPopup("I am a circle.");
// polygon.bindPopup("I am a polygon.");

// for api key using for direction and routing the path for live tracking
// var apiKey = "5b3ce3597851110001cf6248ff4898aef2c745db822aa3b0ef96626f ";
// var routeLine = null;

// async function drawRoute(start, end) {
//     var url = `https://api.openrouteservice.org/v2/directions/driving-car?api_key=${apiKey}&start=${start.lng},${start.lat}&end=${end.lng},${end.lat}`;

//     let response = await fetch(url);
//     let data = await response.json();

//     var coordinates = data.routes[0].geometry.coordinates.map(c => [c[1], c[0]]);

//     if (routeLine) {
//         map.removeLayer(routeLine);
//     }

//     routeLine = L.polyline(coordinates, { color: 'blue', weight: 5 }).addTo(map);
// }


//drawRoute({ lat: Lat, lng: Lng }, { lat: 28.50, lng: 76.40 });


// var popup = L.popup()  // this is a standalone popup which is not attached to any marker or polygon or circle it show on first reload the page
//     .setLatLng([28.33, 74.91])
//     .setContent("I am a standalone popup.")
//     .openOn(map);


    console.log("Marker position: ", marker.getLatLng());

    marker.setLatLng([28.33, 74.97]);

    // marker.setZIndexOffset(1000)


//     var path = [
//     [28.33, 74.90],
//     [28.33, 74.92],
//     [28.33, 74.94],
//     [28.33, 74.96]
// ];







var Lat=28.33;
var Lng=74.90;

var previousPolyline = null;

var lastLatLng=marker.getLatLng();
var lastTime= Date.now();
var isReached = false;
var intervalId=null;


intervalId=setInterval(async()=>{

    if (!isReached) {

    marker.setLatLng([Lat, Lng]);
    Lat+=0.0001;  
    Lng+=0.0001;

    var currentTime = Date.now();
    var timeDiff = (currentTime - lastTime)/1000;
    lastTime = currentTime;


   // await drawRoute({ lat: Lat, lng: Lng }, { lat: 28.50, lng: 76.40 });

    // if (previousPolyline) {
    //     map.removeLayer(previousPolyline);
    // }
    //var line = [marker.getLatLng(), marker1.getLatLng()];
   // previousPolyline = L.polyline(line, {color: 'green'}).addTo(map);
   // previousPolyline.bindPopup("This is a line between the markers.");

//map.fitBounds(previousPolyline.getBounds());

//map.fitBounds(marker1.getbounds());

var distance = marker.getLatLng().distanceTo(marker1.getLatLng()).toFixed(2);
distance=distance/1000;

//console.log("LastLatlong->",lastLatLng); 
//console.log("prevLatlong=>",marker.getLatLng());
var travelDistanceBwTwoMarker = marker.getLatLng().distanceTo(lastLatLng);
lastLatLng = marker.getLatLng();

var speed = (travelDistanceBwTwoMarker/timeDiff)*3.6;
var time= (distance/speed);
console.log("Time->"+time.toFixed(2)+"hour");
console.log("Speed->"+speed.toFixed(2)+"km/hr");

console.log("trvel  Distance bw two point->"+travelDistanceBwTwoMarker.toFixed(2)+"meter");

marker.bindPopup("Remaining Distance-> "+distance.toFixed(2)+" km"+"<br>"+"Speed =>"+speed.toFixed(2)+" km/hr"+"<br>"+"Time=>"+time.toFixed(2)+" hour").openPopup();
//console.log("Distance between markers:", distance.toFixed(2),"km");
//console.log("Lat,Long of both->",line);


        if (distance < 147) {
            isReached = true;
            marker.bindPopup("Your item reached the destination!").openPopup();
            console.log("Marker has reached the destination!");
            clearInterval(intervalId);
        }
    }


}, 1000)        







//     var icon = marker.getIcon();
// console.log("Marker icon: ", icon);



    // L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    //     maxZoom: 19,
    // }).addTo(map);

    // L.marker([51.5, -0.09]).addTo(map)
    //     .bindPopup('A pretty CSS3 popup.<br> Easily customizable.')
    //     .openPopup();
