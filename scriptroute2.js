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

function getAngel(start,end){
    let dy=end[0]-start[0];
    let dx=end[1]-start[1];
    let angle=Math.atan2(dy,dx) *(180/Math.PI);
    return (angle+360)%360;
}


var endPoint = [28.4135, 77.0415];
var routeLayer = null;
// var speed = 50;
let prevLocation = null;
let prevTime=Date.now();

var marker1 = L.marker(endPoint).addTo(map);
marker1.bindPopup("<b>Outlet</b><br> Destination point.").openPopup();


navigator.geolocation.getCurrentPosition(
    async function (position) {
        var startPoint = [position.coords.latitude, position.coords.longitude];

        var marker = L.marker(startPoint, { icon: scooterIcon }).addTo(map);

        await getRoute(startPoint, endPoint);

        let watchId = navigator.geolocation.watchPosition(
            async function (position) {
                let currentLocation = [position.coords.latitude, position.coords.longitude];

                let currentTime=Date.now();
                if(prevLocation){

                    let angle=getAngel(prevLocation, currentLocation);
                    marker.setRotationAngle(angle);

                    let distance = map.distance(prevLocation, currentLocation)/1000;

                    if(distance>0.01){
                        console.log("Route updated");
                        await getRoute(currentLocation, endPoint);
                    }


                    let timeDiff=(currentTime-prevTime)/3600000;
                    speed=(distance/timeDiff).toFixed(2);
                }
                prevLocation=currentLocation;
                prevTime=currentTime;
                

                marker.setLatLng(currentLocation);
           


         
                let { distance, time,} = await getRouteDistanceTime(
                    position.coords.latitude, position.coords.longitude,
                    endPoint[0], endPoint[1]
                );

   
                marker.bindPopup(`
                    Remaining Distance: ${distance} km<br>
                    Speed: ${speed} km/hr<br>
                    Estimated Time: ${time}
                `).openPopup();

                console.log("Latitude: " + position.coords.latitude);
                console.log("Longitude: " + position.coords.longitude);

                if(distance<1){
                    routeLayer.setStyle({color: 'green', weight: 4});
                }

                if (distance < 0.1) {
                    marker.bindPopup("Your item reached the destination!").openPopup();
                }
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
    },
    function (error) {
        console.error("Error getting initial location:", error);
    }
);

async function getRoute(start, end) {
    let url = `https://router.project-osrm.org/route/v1/driving/${start[1]},${start[0]};${end[1]},${end[0]}?overview=full&geometries=geojson`;
    let response = await fetch(url);
    let data = await response.json();
    let coordinates = data.routes[0].geometry.coordinates.map(c => [c[1], c[0]]);
    if (routeLayer) map.removeLayer(routeLayer);
    routeLayer = L.polyline(coordinates, { color: 'blue', weight: 4 }).addTo(map);
}

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
    return { distance: "Not Available", time: "Not Available" , speed: "Not Available"};
}

function formatTime(time) {
    var totalMinutes = Math.floor(time * 60);
    var hours = Math.floor(totalMinutes / 60);
    var minutes = totalMinutes % 60;
    return `${hours} hour(s) ${minutes} minute(s)`;
}
