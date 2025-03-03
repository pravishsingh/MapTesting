var map = L.map('map').setView([28.37, 76.92], 13); // Initial map setup

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
}).addTo(map);

var scooterIcon = L.icon({
    iconUrl: 'makDriv.png',
    iconSize: [200, 200],
    popupAnchor: [0, -60],
    className: 'scooter-icon'
});

var marker = L.marker([28.37, 76.92], { icon: scooterIcon }).addTo(map);
var marker1 = L.marker([28.50, 76.40]).addTo(map);
marker1.bindPopup("<b>Outlet</b><br> Destination point.").openPopup();

var Lat = 28.33;
var Lng = 74.90;
var lastLatLng = marker.getLatLng();
var lastTime = Date.now();
var isReached = false;
var intervalId = null;

function generateGoogleMapLink(startLat, startLng, endLat, endLng) {
    return `https://www.google.com/maps/dir/${startLat},${startLng}/${endLat},${endLng}`;
}
function formatTime(time) {
    var totalMinutes = Math.floor(time * 60);
    var hours = Math.floor(totalMinutes / 60);
    var minutes = totalMinutes % 60;
    return `${hours} hour(s) ${minutes} minute(s)`;
}
intervalId = setInterval(() => {
    if (!isReached) {
        marker.setLatLng([Lat, Lng]);
        Lat += 0.0001;
        Lng += 0.0001;

        var currentTime = Date.now();
        var timeDiff = (currentTime - lastTime) / 1000;
        lastTime = currentTime;

        var distance = marker.getLatLng().distanceTo(marker1.getLatLng()) / 1000;
        var travelDistanceBwTwoMarker = marker.getLatLng().distanceTo(lastLatLng);
        lastLatLng = marker.getLatLng();

        var speed = (travelDistanceBwTwoMarker / timeDiff) * 3.6;
        var time = distance / speed;

        console.log("testtime",time);

        var googleMapsLink = generateGoogleMapLink(Lat, Lng, 28.50, 76.40);

        console.log("Time->", formatTime(time));
        console.log("Speed->", speed.toFixed(2), "km/hr");
        console.log("Distance->", distance.toFixed(2), "km");

        marker.bindPopup(`Remaining Distance: ${distance.toFixed(2)} km<br>Speed: ${speed.toFixed(2)} km/hr<br>Time: ${formatTime(time)}<br><a href='${googleMapsLink}' target='_blank'>Track your location</a>`).openPopup();

        if (distance < 147) {
            isReached = true;
            marker.bindPopup("Your item reached the destination!").openPopup();
            clearInterval(intervalId);
        }
    }
}, 1000);
