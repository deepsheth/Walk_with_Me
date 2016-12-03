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

	var onKeyEnteredRegistration = geoQuery.on("key_entered", function(key, location, distance) {
	  console.log(key + " entered query at " + location + " (" + distance + " km from center)");
	});
	// lol idk what to do with geoQuery
}

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

function addMarker (map, pos, icon, key) {

	var baseMarkerURL = "/img/marker/";
	var marker_icon;

	// key should only be null for current location marker
	if (key == null) {
		marker_icon = baseMarkerURL + "current_location.png";
		new google.maps.Marker({
	    	position: pos,
			icon: marker_icon,
			title: "null",
			map: map
		});

		return;	
	}

 	var angled_marker = {
          path: 'm12 0c-4.4183 2.3685e-15 -8 3.5817-8 8 0 1.421 0.3816 2.75 1.0312 3.906 0.1079 0.192 0.221 0.381 0.3438 0.563l6.625 11.531 6.625-11.531c0.102-0.151 0.19-0.311 0.281-0.469l0.063-0.094c0.649-1.156 1.031-2.485 1.031-3.906 0-4.4183-3.582-8-8-8zm0 4c2.209 0 4 1.7909 4 4 0 2.209-1.791 4-4 4-2.2091 0-4-1.791-4-4 0-2.2091 1.7909-4 4-4z',
          scale: 1.75,
          fillColor: '#e74c3c',
          fillOpacity: 1,
          strokeColor: '#c0392b',
          strokeWeight: 3,
          rotation: 45,
    };

    var title;
    var map_marker = new google.maps.Marker({
    	position: pos,
		icon: angled_marker,
		map: map
	});

	map_marker.addListener('click', function() {
		var walk_info = get_walk_data(key, "posted");
		display_walk_info(walk_info);
    });


}

function addMarkerHelper(key, location, distance, icon) {
	var pos = {
	    	lat: location[0],
	    	lng: location[1]
	}

	addMarker(map, pos, "red", key);
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

//pass it the walk id and the type of walk
//type of walk would be 'posted', 'current', or 'past'
function get_walk_data(walkID, type){
	var acceptableTypes = ['posted','current','past'];
	if (!acceptableTypes.includes(type)){
		console.log("incorrect walk type, must be 'posted', 'current', or 'past'");
		return null;
	}
	if (!user){
		var user = firebase.auth().currentUser;
	}
	if (!user){
		console.log("User not signed in");
		return null;
	}

	var walkData = {};

	if(type == 'posted'){
		firebase.database().ref('/posted_walks/' + walkID).once('value').then(function(snapshot) {
			walkData['poster_id'] = snapshot.val().poster_id;
			walkData['start_latitude'] = snapshot.val().start_latitude;
			walkData['start_longitude'] = snapshot.val().start_longitude;
			walkData['end_latitude'] = snapshot.val().end_latitude;
			walkData['end_longitude'] = snapshot.val().end_longitude;
			walkData['destination_name'] = snapshot.val().destination_name;
			walkData['time'] = snapshot.val().time;
		});
	}
	else if(type == 'current'){
		firebase.database().ref('/posted_walks/' + walkID).once('value').then(function(snapshot) {
			walkData['poster_id'] = snapshot.val().poster_id;
			walkData['responder_id'] = snapshot.val().responder_id;
			walkData['responder_name'] = snapshot.val().responder_name;
			walkData['responder_num_walks'] = snapshot.val().responder_num_walks;
			walkData['responder_location'] = snapshot.val().responder_location;
			walkData['chat_id'] = snapshot.val().chat_id;
			walkData['start_latitude'] = snapshot.val().start_latitude;
			walkData['start_longitude'] = snapshot.val().start_longitude;
			walkData['end_latitude'] = snapshot.val().end_latitude;
			walkData['end_longitude'] = snapshot.val().end_longitude;
			walkData['destination_name'] = snapshot.val().destination_name;
			walkData['time'] = snapshot.val().time;
		});
	}
	else if(type == 'past'){
		firebase.database().ref('/posted_walks/' + walkID).once('value').then(function(snapshot) {
			walkData['poster_id'] = snapshot.val().poster_id;
			walkData['responder_id'] = snapshot.val().responder_id;
			walkData['responder_name'] = snapshot.val().responder_name;
			walkData['responder_num_walks'] = snapshot.val().responder_num_walks;
			walkData['responder_location'] = snapshot.val().responder_location;
			walkData['chat_id'] = snapshot.val().chat_id;
			walkData['start_latitude'] = snapshot.val().start_latitude;
			walkData['start_longitude'] = snapshot.val().start_longitude;
			walkData['end_latitude'] = snapshot.val().end_latitude;
			walkData['end_longitude'] = snapshot.val().end_longitude;
			walkData['destination_name'] = snapshot.val().destination_name;
			walkData['time'] = snapshot.val().time;
		});
	}

	return walkData;
}

function display_walk_info(walk_info) {
	$('#walk-info-modal').modal('open');

	
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
	// INIT
	// =======================


    $('.modal').modal();
});