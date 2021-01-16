let map;
let distanceMatrixService;
let placeService;
let directionsService;
let directionsRenderer;

let startInput = document.getElementById('startInput');
let endInput = document.getElementById('endInput');
let mainForm = document.getElementById('form');
let gasDisplay = document.getElementById('gasDisplay');

function initMap() {
  let TorontoLocation = new google.maps.LatLng(43.6532, -79.3832);
  map = new google.maps.Map(document.getElementById('map'), {
    center: TorontoLocation,
    zoom: 12,
  });

  // Init Services
  directionsService = new google.maps.DirectionsService();
  distanceMatrixService = new google.maps.DistanceMatrixService();
  placeService = new google.maps.places.PlacesService(map);
  directionsRenderer = new google.maps.DirectionsRenderer();
  directionsRenderer.setMap(map);

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

    startPlace = startAutocomplete.getPlace();
    endPlace = endAutocomplete.getPlace();

    var searchRequest = {
      location: startPlace.geometry.location,
      radius: '5000',
      query: '',
      type: 'gas_station',
    };

    placeService.nearbySearch(searchRequest, nearbySearchCallback);

    /*
      Directions Request
    */
    let directionsRequest = {
      origin: startPlace.geometry.location,
      destination: endPlace.geometry.location,
      travelMode: 'DRIVING',
    };

    directionsService.route(directionsRequest, directionsRequestCallback);
  });
}

function nearbySearchCallback(results, status) {
  if (status == google.maps.places.PlacesServiceStatus.OK) {
    for (var i = 0; i < results.length; i++) {
      createMarker(results[i]);
    }

    /*
      GETTING DISTANCES USING DIRECTIONS MATRIX
    */

    transformedResults = results.map((res) => res.geometry.location);

    // distance from start to each gas station
    let distanceMatrixReq1 = {
      origins: [startPlace.geometry.location],
      destinations: transformedResults,
      travelMode: 'DRIVING',
    };

    // distance from each gas station to end
    let distanceMatrixReq2 = {
      origins: transformedResults,
      destinations: [endPlace.geometry.location],
      travelMode: 'DRIVING',
    };

    distanceMatrixService.getDistanceMatrix(
      distanceMatrixReq1,
      distanceMatrixCallback1
    );

    //key is address of gas station
    distanceDictionary = {};

    function distanceMatrixCallback1(results, status) {
      if (status == 'OK') {
        let res = parseDistanceMatrix(results);
        console.log(res);

        // add response to distanceDictionary
        for (item of res) {
          distanceDictionary[item.to] = {
            address: item.to,
            distanceTo: item.distance,
            durationTo: item.duration,
          };
        }

        distanceMatrixService.getDistanceMatrix(
          distanceMatrixReq2,
          distanceMatrixCallback2
        );
      } else {
        handleError('Distance Matrix', status);
      }
    }

    function distanceMatrixCallback2(results, status) {
      if (status == 'OK') {
        let res = parseDistanceMatrix(results);
        console.log(res);

        let updatedDict = { ...distanceDictionary };

        for (item of res) {
          prevDistance = distanceDictionary[item.from].distanceTo;
          prevDuration = distanceDictionary[item.from].durationTo;
          updatedDict[item.from] = {
            ...distanceDictionary[item.from],
            distanceFrom: item.distance,
            durationFrom: item.duration,
            totalDistance: item.distance + prevDistance,
            totalDuration: item.duration + prevDuration,
          };
        }
        distanceDictionary = updatedDict;

        console.log(distanceDictionary); /*DEBUG*/
        renderGasStations(Object.values(distanceDictionary));
      } else {
        handleError('Distance Matrix', status);
      }
    }
  } else {
    handleError('Nearby Search', status);
  }
}

function renderGasStations(distanceValues) {
  let sortedValues = distanceValues.sort(
    (a, b) => a.totalDistance - b.totalDistance
  );

  gasItemsArray = [];

  for (item of sortedValues) {
    let address = item.address;
    let gasItem = document.createElement('div');
    gasItem.classList.add('gas__item');

    let gasItemTitle = document.createElement('h3');
    gasItemTitle.classList.add('gas__item__title');
    gasItemTitle.innerText = item.address;
    gasItem.appendChild(gasItemTitle);


    gasItem.innerHTML = `
    <h3 class="gas__item__title">${item.address}</h3>
    <p class="gas__item__label">
      total distance = ${(item.totalDistance / 1000).toFixed(1)} km
      </p>
      <p class="gas__item__label">
      total duration = ${(item.totalDuration / 60).toFixed(1)} minutes
      </p>
    `;

    let buttonItem = document.createElement('button');
    buttonItem.classList.add('button');
    buttonItem.classList.add('gas__item__button');
    buttonItem.innerText = 'Add To Route';

    buttonItem.addEventListener('click', () => {
      clearGasItemsHighlight();
      gasItem.classList.add('gas__item--highlighted');
      addToRoute(address);
    });

     .push(gasItem);
    gasItem.appendChild(buttonItem);
    gasDisplay.appendChild(gasItem);
  }
}


function addToRoute(address) {
  console.log(address); /*DEBUG*/

  let directionsRequest = {
    origin: startPlace.geometry.location,
    waypoints: [{ location: address, stopover: true }],
    destination: endPlace.geometry.location,
    travelMode: 'DRIVING',
  };
  directionsService.route(directionsRequest, directionsRequestCallback);
}

function clearGasItemsHighlight() {
  for (item of gasItemsArray) {
    item.classList.remove('gas__item--highlighted');
  }
}

function directionsRequestCallback(result, status) {
  if (status == 'OK') {
    directionsRenderer.setDirections(result);
  } else {
    handleError('Directions Service', status);
  }
}
