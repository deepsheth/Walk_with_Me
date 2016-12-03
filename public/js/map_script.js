var map;
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

        addMarker(map, pos, "current_location");

	    map.setCenter(pos);
	    get_posted_walks(pos.lat, pos.lng);

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
	var baseMarkerURL = "/img/marker/";
	var marker_icon;

	if (icon != null) {
		marker_icon = baseMarkerURL + icon + ".png";
	}
	else {
		marker_icon = baseMarkerURL + "default.png";
	}

	var beachMarker = new google.maps.Marker({
		position: pos,
		map: map,
		icon: marker_icon
    });
}

function addMarkerHelper(key, location, distance, icon) {
	var pos = {
	    	lat: location[0],
	    	lng: location[1]
	}
	
	console.log(pos);
	addMarker(map, pos, "red");
}

function postWalk(user_id,start_lat,start_lon,end_lat,end_lon,destination_name){
	var firebaseRef = firebase.database().ref();
	var geoFire = new GeoFire(firebaseRef.child('posted_walks_geofire'));

	var data = {}
	data["poster_id"] = user_id;
	data["start_lat"] = start_lat;
	data["start_lon"] = start_lon;
	data["end_lat"] = end_lat;
	data["end_lon"] = end_lon;
	data["destination_name"] = destination_name;
	data["time"] = new Date().getTime();

	var walk_id = firebaseRef.child('posted_walks').push().getKey();
	firebaseRef.child("posted_walks").child(walk_id).set(data);

	geoFire.set(walk_id, [start_lat,start_lon]);
	return true;
}

function get_posted_walks(latitude, longitude){
	console.log("getting walks from " + latitude + " , " + longitude);

	var firebaseRef = firebase.database().ref("posted_walks_geofire");
	var geoFire = new GeoFire(firebaseRef);

	center = [latitude,longitude];
	//center["latitude"] = latitude;
	//center["longitude"] = longitude;

	var geoQuery = geoFire.query({
		center: center,
		radius: 2 //kilometers
	});

	var onKeyEnteredRegistration = geoQuery.on("key_entered", function(key, location, distance) {
	    
		addMarkerHelper(key, location, distance, "red");

		// all_markers.push(marker);
		// console.log("Key: " + key + " Location: " + location + " Distance: " + distance);
	});
	// lol idk what to do with geoQuery
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