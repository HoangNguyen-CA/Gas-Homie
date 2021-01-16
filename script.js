let map;
let distanceMatrixService;
let placeService;
let directionsService;
let directionsRenderer;

let startInput = document.getElementById('startInput');
let endInput = document.getElementById('endInput');
let mainForm = document.getElementById('form');
let gasDisplay = document.getElementById('gasDisplay');

let sortDurationButton = document.getElementById('sortDurationButton');
let sortDistanceButton = document.getElementById('sortDistanceButton');
let sortPriceButton = document.getElementById('sortPriceButton');

let startPlace;
let endPlace;
let gasItemsArray = [];

function initMap() {
  let CanadaLocation = new google.maps.LatLng(56.1304, -106.3468);
  map = new google.maps.Map(document.getElementById('map'), {
    center: CanadaLocation,
    zoom: 4,
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
      var place = results[i];
      createMarker(place);
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

        console.log(distanceDictionary);
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
  console.log(distanceValues);
  let sortedValues = distanceValues.sort(
    (a, b) => a.totalDistance - b.totalDistance
  );

  gasItemsArray = [];
  gasDisplay.innerHTML = '';

  for (item of sortedValues) {
    let address = item.address;
    let gasItem = document.createElement('div');
    gasItem.classList.add('gas__item');

    let gasItemTitle = createDOMElement(
      'h3',
      ['gas__item__title'],
      item.address
    );

    let gasItemLabel1 = createDOMElement(
      'p',
      ['gas__item__label'],
      `total distance: ${convertDist(item.totalDistance)}`
    );

    let gasItemLabel2 = createDOMElement(
      'p',
      ['gas__item__label'],
      `total duration: ${convertTime(item.totalDuration)}`
    );

    let buttonItem = createDOMElement(
      'button',
      ['button', 'gas__item__button'],
      'Add To Route'
    );

    elementAppendChildren(gasItem, [
      gasItemTitle,
      gasItemLabel1,
      gasItemLabel2,
      buttonItem,
    ]);

    gasItemsArray.push(gasItem);
    gasDisplay.appendChild(gasItem);

    buttonItem.addEventListener('click', () => {
      clearGasItemsHighlight();
      gasItem.classList.add('gas__item--highlighted');
      addToRoute(address);
    });
  }
}

function addToRoute(address) {
  console.log(address);
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
