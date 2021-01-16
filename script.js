let map;

function initMap() {
  let CanadaLocation = new google.maps.LatLng(56.1304, -106.3468);
  map = new google.maps.Map(document.getElementById('map'), {
    center: CanadaLocation,
    zoom: 4,
  });
}
