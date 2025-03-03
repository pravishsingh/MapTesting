var map = L.map('map').setView([28.37, 76.92], 13); // Initial map setup

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
}).addTo(map);

var scooterIcon = L.icon({
    iconUrl: 'makDriv.png',
    iconSize: [50, 50],
    popupAnchor: [0, -20],
    className: 'scooter-icon'
});

var startPoint = [28.39, 77.04];
var endPoint = [28.4135, 77.0415];

var marker = L.marker(startPoint, { icon: scooterIcon }).addTo(map);
var marker1 = L.marker(endPoint).addTo(map);
marker1.bindPopup("<b>Outlet</b><br> Destination point.").openPopup();

var routeLayer = null;
var coordinates = [];
var index = 0;
var speed = 50; // Speed in km/hr
var intervalId = null;

async function getRoute(start, end) {
    let url = `https://router.project-osrm.org/route/v1/driving/${start[1]},${start[0]};${end[1]},${end[0]}?overview=full&geometries=geojson`;
    let response = await fetch(url);
    let data = await response.json();
    coordinates = data.routes[0].geometry.coordinates.map(c => [c[1], c[0]]);
    // console.log(coordinates);
    routeLayer = L.polyline(coordinates, { color: 'blue', weight: 4 }).addTo(map);
}


var traveledPath = [];

async function startJourney() {
    await getRoute(startPoint, endPoint);

    let watchId = navigator.geolocation.watchPosition(
        async function (position) {
            let lat = position.coords.latitude;
            let lng = position.coords.longitude;
            let currentPos = [lat, lng];

            console.log("Current Position ->", currentPos);
            marker.setLatLng(currentPos);

            traveledPath.push(currentPos);

            coordinates = coordinates.filter(coord => {
                return !(Math.abs(coord[0] - lat) < 0.0005 && Math.abs(coord[1] - lng) < 0.0005);
            });

            if (coordinates.length === 0) {
                if (routeLayer) {
                    map.removeLayer(routeLayer);
                }
                marker.bindPopup("Your item reached the destination!").openPopup();
                navigator.geolocation.clearWatch(watchId);
                return;
            }

            if (routeLayer) {
                map.removeLayer(routeLayer);
            }
            routeLayer = L.polyline(coordinates, { color: 'blue', weight: 4 }).addTo(map);

            L.polyline(traveledPath, { color: 'gray', weight: 3, dashArray: "5, 10" }).addTo(map);

            let { distance, time } = await getRouteDistanceTime(lat, lng, endPoint[0], endPoint[1]);

            marker.bindPopup(`
                Remaining Distance: ${distance} km<br>
                Speed: ${speed} km/hr<br>
                Estimated Time: ${time}
            `).openPopup();
        },
        function (error) {
            console.error("Error getting location:", error);
        },
        {
            enableHighAccuracy: true,
            maximumAge: 0,
            timeout: 2000
        }
    );
}





// index = 0;
//intervalId = setInterval(async () => {
//  if (index < coordinates.length) {
//marker.setLatLng();
//index++;
// await getRoute([coordinates[index][0], coordinates[index][1]], [endPoint[0], endPoint[1]]);
// let { distance, time } = await getRouteDistanceTime(coordinates[index][0], coordinates[index][1], endPoint[0], endPoint[1]);

// console.log("Remaining Distance->", distance, "km");
// console.log("Estimated Time->", time);

// marker.bindPopup(`
//     Remaining Distance: ${distance} km<br>
//     Speed: ${speed} km/hr<br>
//     Estimated Time: ${time}
// `).openPopup();

//             if (index === coordinates.length - 1) {
//                 clearInterval(intervalId);
//                 marker.bindPopup("Your item reached the destination!").openPopup();
//             }
//         }
//     }, 1000);
// }

async function getRouteDistanceTime(startLat, startLng, endLat, endLng) {
    let url = `https://router.project-osrm.org/route/v1/driving/${startLng},${startLat};${endLng},${endLat}?overview=full&geometries=geojson`;
    let response = await fetch(url);
    let data = await response.json();
    if (data.routes.length > 0) {
        let distance = data.routes[0].distance / 1000;
        let duration = data.routes[0].duration;
        let time = (duration / 3600).toFixed(2);
        return { distance: distance.toFixed(2), time: formatTime(time) };
    }
    return { distance: "Not Available", time: "Not Available" };
}

function formatTime(time) {
    var totalMinutes = Math.floor(time * 60);
    var hours = Math.floor(totalMinutes / 60);
    var minutes = totalMinutes % 60;
    return `${hours} hour(s) ${minutes} minute(s)`;
}

startJourney();
