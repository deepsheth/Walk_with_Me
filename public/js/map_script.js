function postWalk(user_id,start_lat,start_lon,end_lat,end_lon,destination_name){
	var firebaseRef = firebase.database().ref("posted_walks");
	var geoFire = new GeoFire(firebaseRef);

	var data = {}
	data["poster_id"] = user_id;
	data["start_lat"] = start_lat;
	data["start_lon"] = start_lon;
	data["end_lat"] = end_lat;
	data["end_lon"] = end_lon;
	data["destination_name"] = destination_name;
	data["time"] = new Date().getTime();

	var walk_id = firebaseRef.push().getKey();
	firebaseRef.child("posted_walks").child(walk_id).setValue(data);

	geoFire.setLocation(walk_id, new GeoLocation(start_lat,start_lon));
	return true;
}

function get_posted_walks(latitude, longitude){
	var firebaseRef = firebase.database().ref("posted_walks");
	var geoFire = new GeoFire(firebaseRef);

	center = {};
	center["latitude"] = latitude;
	center["longitude"] = longitude;

	var geoQuery = geoFire.query({
		center: center,
		radius: 2 //kilometers
	});

	// lol idk what to do with geoQuery
}

function initMap() {
	map = new google.maps.Map(document.getElementById('map'), {
	  center: {lat: 40.6069, lng: -75.3783},
	  zoom: 16
	});

	// Try HTML5 geolocation.
	if (navigator.geolocation) {
	  navigator.geolocation.getCurrentPosition(function(position) {
	    var pos = {
	      lat: position.coords.latitude,
	      lng: position.coords.longitude
	    };

	    var image = 'https://developers.google.com/maps/documentation/javascript/examples/full/images/beachflag.png';
        var beachMarker = new google.maps.Marker({
          position: {lat: -33.890, lng: 151.274},
          map: map,
          icon: image
        });

        addMarker(map, pos, icon);

	    map.setCenter(pos);
	  }, function() {
	    handleLocationError(true, infoWindow, map.getCenter());
	  });
	} else {
	  // Browser doesn't support Geolocation
	  handleLocationError(false, infoWindow, map.getCenter());
	}
	}

	function handleLocationError(browserHasGeolocation, infoWindow, pos) {
		Materialize.toast("Geolocation failed.");
	}

function addMarker (map, pos, icon) {
	var beachMarker = new google.maps.Marker({
		position: {lat: -33.890, lng: 151.274},
		map: map,
		icon: image
    });

}

function sign_out() {
	firebase.auth().signOut().then(function() {
		window.location.href = "/";
	}, function(error) {
	// An error happened.
	alert("Problem logging out.");
	});	
}


$(document).ready( function() {
	
	// =======================
	// AUTH
	// =======================
	firebase.auth().onAuthStateChanged(function(user) {
		if (!user) {
			window.location.href = "/";
		}
	});

	$('#btn_log_out').click(function() { sign_out(); });

	// =======================
	// MAP
	// =======================
});