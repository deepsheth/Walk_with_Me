function initMiniMap() {
	map = new google.maps.Map(document.getElementById('mini-map'), {
	  center: {lat: 40.6069, lng: -75.3783},
	  zoom: 17
	});

	// Try HTML5 geolocation.
	if (navigator.geolocation) {
	  navigator.geolocation.getCurrentPosition(function(position) {
	    var pos = {
	      lat: position.coords.latitude,
	      lng: position.coords.longitude
	    };

	    map.setCenter(pos);
	  }, function() {
	    handleLocationError(true, infoWindow, map.getCenter());
	  });
	} else {
	  // Browser doesn't support Geolocation
	  handleLocationError(false, infoWindow, map.getCenter());
	}
}