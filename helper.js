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

//given number of seconds, produces the number of hours 
//and minutes (rounded to the nearest minute)
function convertTime(seconds) {
    
    var time = "";
    var hours;
    var mins;
    var hour = 3600;
    var min = 60;
    if (seconds > hour) {
      hours = Math.floor(seconds/hour);
      time = time.concat(hours.toString() + " hour ");
      seconds = seconds - hours * hour;
    }  
    
    mins = Math.round(seconds/min);
    time = time.concat(mins.toString() + " min");
    
    
    return time;
}

function handleError(name, status) {
  alert(`${name} was not successful for the following reason: ${status}`);
}
