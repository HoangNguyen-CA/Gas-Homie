let map;
let distanceMatrixService;
let placeService;
let directionsService;
let directionsRenderer;

let startInput = document.getElementById('startInput');
let endInput = document.getElementById('endInput');
let mainForm = document.getElementById('form');

function initMap() {
  let CanadaLocation = new google.maps.LatLng(56.1304, -106.3468);
  map = new google.maps.Map(document.getElementById('map'), {
    center: CanadaLocation,
    zoom: 4,
  });

  // Init Services
  directionsService = new google.maps.DirectionsService();
  directionsRenderer = new google.maps.DirectionsRenderer();
  distanceMatrixService = new google.maps.DistanceMatrixService();
  placeService = new google.maps.places.PlacesService(map);

  // Init autocomplete fields
  var autocompleteOptions = {
    componentRestrictions: { country: 'ca' },
  };

  let startAutocomplete = new google.maps.places.Autocomplete(
    startInput,
    autocompleteOptions
  );

  let endAutocomplete = new google.maps.places.Autocomplete(
    endInput,
    autocompleteOptions
  );

  mainForm.addEventListener('submit', (event) => {
    event.preventDefault();

    startAutocomplete.getPlace();
  });
}
