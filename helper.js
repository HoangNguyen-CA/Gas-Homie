function createMarker(place) {
  const marker = new google.maps.Marker({
    map,
    position: place.geometry.location,
  });
  google.maps.event.addListener(marker, 'click', () => {
    let infowindow = new google.maps.InfoWindow();
    infowindow.setContent(place.name);
    infowindow.open(map, marker);
  });
}

// helper function to parse  data from direction matrix responses
function parseDistanceMatrix(response) {
  var origins = response.originAddresses;
  var destinations = response.destinationAddresses;

  let ansArr = [];
  for (var i = 0; i < origins.length; i++) {
    var results = response.rows[i].elements;
    for (var j = 0; j < results.length; j++) {
      var element = results[j];
      ans = {};
      ans.distanceText = element.distance.text;
      ans.durationText = element.duration.text;
      ans.distance = element.distance.value; // in meters
      ans.duration = element.duration.value; // in second
      ans.from = origins[i];
      ans.to = destinations[j];
      ansArr.push(ans);
    }
  }
  return ansArr;
}
