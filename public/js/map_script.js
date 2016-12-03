function postWalk(user_id, user_name, num_walks, start_lat,start_lon,end_lat,end_lon,destination_name, icon, usr_name){

	var firebaseRef = firebase.database().ref();
	var geoFire = new GeoFire(firebaseRef.child('posted_walks_geofire_test'));

	var data = {};
	data["poster_id"] = user_id;
	data["poster_name"] = user_name;
	data["poster_num_walks"] = num_walks;
	data["start_latitude"] = start_lat;
	data["start_longitude"] = start_lon;
	data["end_latitude"] = end_lat;
	data["end_longitude"] = end_lon;
	data["destination_name"] = destination_name;
	data["icon"] = false;
	data["time"] = new Date().getTime();

	var walk_id = firebaseRef.child('posted_walks_test').push().getKey();
	firebaseRef.child("posted_walks_test").child(walk_id).set(data);

	geoFire.set(walk_id, [start_lat,start_lon]);
	return true;

}

/*
	old
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
}*/

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
	console.log('-----');
	console.log(map);
	console.log(pos);
	console.log(icon);
	console.log(key);
	console.log('-----');
	var baseMarkerURL = "/img/marker/";
	var marker_icon;

	// key should only be null for current location marker
	if (key == null) {

		var mkr = {
	          path: 'm12 3c-2.7614 0-5 2.2386-5 5 0 2.761 2.2386 5 5 5 2.761 0 5-2.239 5-5 0-2.7614-2.239-5-5-5zm0 2c1.657 0 3 1.3431 3 3s-1.343 3-3 3-3-1.3431-3-3 1.343-3 3-3z',
	          scale: 1.75,
	          fillColor: '#0769AD',
	          fillOpacity: .85,
	          strokeColor: '#004A7C',
	          strokeWeight: 5
	    };

			var location_mkr = new google.maps.Marker({
		    	position: pos,
				icon: mkr,
				title: "null",
				map: map
			});

			location_mkr.addListener('click', function() {
				Materialize.toast("Your location", 3000);
			})


		return;	
	}

	var walkData = {};
	firebase.database().ref('posted_walks_test/' + key).once('value').then(function(snapshot) {
		console.log(snapshot.val());
		walkData['poster_id'] = snapshot.val().poster_id;
		walkData['start_latitude'] = snapshot.val().start_latitude;
		walkData['start_longitude'] = snapshot.val().start_longitude;
		walkData['end_latitude'] = snapshot.val().end_latitude;
		walkData['end_longitude'] = snapshot.val().end_longitude;
		walkData['destination_name'] = snapshot.val().destination_name;
		walkData['time'] = snapshot.val().time;

		var angle = getAngle(walkData["start_latitude"], walkData["start_longitude"], walkData["end_latitude"], walkData["end_longitude"]);
		console.log("angle: " + angle);

	 	var angled_marker = {
	          path: 'm12 0c-4.4183 2.3685e-15 -8 3.5817-8 8 0 1.421 0.3816 2.75 1.0312 3.906 0.1079 0.192 0.221 0.381 0.3438 0.563l6.625 11.531 6.625-11.531c0.102-0.151 0.19-0.311 0.281-0.469l0.063-0.094c0.649-1.156 1.031-2.485 1.031-3.906 0-4.4183-3.582-8-8-8zm0 4c2.209 0 4 1.7909 4 4 0 2.209-1.791 4-4 4-2.2091 0-4-1.791-4-4 0-2.2091 1.7909-4 4-4z',
	          scale: 1.75,
	          fillColor: '#e74c3c',
	          fillOpacity: 1,
	          strokeColor: '#c0392b',
	          strokeWeight: 3,
	          rotation: angle,
	    };

	    var title;
	    var map_marker = new google.maps.Marker({
	    	position: pos,
			icon: angled_marker,
			map: map
		});

		map_marker.addListener('click', function() {
			firebase.auth().onAuthStateChanged(function(user) {
				if (user) {
					get_walk_data(key, "posted",user,function(walk_info){
						display_walk_info(walk_info);
					});
				}
			});
			
	    });
		});

	


}

function addMarkerHelper(key, location, distance, icon) {
	var pos = {
	    	lat: location[0],
	    	lng: location[1]
	}

	addMarker(map, pos, "red", key);
}

function radians(n) {
  return n * (Math.PI / 180);
}
function degrees(n) {
  return n * (180 / Math.PI);
}

function getAngle(start_lat, start_lng, end_lat, end_lng){
  startLat = radians(start_lat);
  startLong = radians(start_lng);
  endLat = radians(end_lat);
  endLong = radians(end_lng);

  var dLong = endLong - startLong;

  var dPhi = Math.log(Math.tan(endLat/2.0+Math.PI/4.0)/Math.tan(startLat/2.0+Math.PI/4.0));
  if (Math.abs(dLong) > Math.PI){
    if (dLong > 0.0)
       dLong = -(2.0 * Math.PI - dLong);
    else
       dLong = (2.0 * Math.PI + dLong);
  }

  return (degrees(Math.atan2(dLong, dPhi)) + 360.0) % 360.0;
}

/*
	More accurate
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
}*/

function get_posted_walks(latitude, longitude){

	var firebaseRef = firebase.database().ref();
	var geoFire = new GeoFire(firebaseRef.child('posted_walks_geofire_test'));

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
		console.log("Key: " + key + " Location: " + location + " Distance: " + distance);
	});
	// lol idk what to do with geoQuery
}

//pass it the walk id and the type of walk
//type of walk would be 'posted', 'current', or 'past'
function get_walk_data(walkID, type, user,after){
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
		firebase.database().ref('/posted_walks_test/' + walkID).once('value').then(function(snapshot) {
			walkData['poster_id'] = snapshot.val().poster_id;
			walkData['start_latitude'] = snapshot.val().start_latitude;
			walkData['start_longitude'] = snapshot.val().start_longitude;
			walkData['end_latitude'] = snapshot.val().end_latitude;
			walkData['end_longitude'] = snapshot.val().end_longitude;
			walkData['destination_name'] = snapshot.val().destination_name;
			walkData['time'] = snapshot.val().time;
			after(walkData);
		});
	}
	else if(type == 'current'){
		firebase.database().ref('/current_walks/' + walkID).once('value').then(function(snapshot) {
			walkData['poster_id'] = snapshot.val().poster_id;
			walkData['responder_id'] = snapshot.val().responder_id;
			walkData['responder_name'] = snapshot.val().responder_name;
			walkData['responder_num_walks'] = snapshot.val().responder_num_walks;
			walkData['responder_location'] = snapshot.val().responder_location;
			walkData['start_latitude'] = snapshot.val().start_latitude;
			walkData['start_longitude'] = snapshot.val().start_longitude;
			walkData['end_latitude'] = snapshot.val().end_latitude;
			walkData['end_longitude'] = snapshot.val().end_longitude;
			walkData['destination_name'] = snapshot.val().destination_name;
			walkData['time'] = snapshot.val().time;
			after(walkData);
		});
	}
	else if(type == 'past'){
		console.log(walkID);
		firebase.database().ref('/past_walks/' + walkID).once('value').then(function(snapshot) {
			walkData['poster_id'] = snapshot.val().poster_id;
			walkData['responder_id'] = snapshot.val().responder_id;
			walkData['responder_name'] = snapshot.val().responder_name;
			walkData['responder_num_walks'] = snapshot.val().responder_num_walks;
			walkData['responder_location'] = snapshot.val().responder_location;
			walkData['start_latitude'] = snapshot.val().start_latitude;
			walkData['start_longitude'] = snapshot.val().start_longitude;
			walkData['end_latitude'] = snapshot.val().end_latitude;
			walkData['end_longitude'] = snapshot.val().end_longitude;
			walkData['destination_name'] = snapshot.val().destination_name;
			walkData['time'] = snapshot.val().time;
			after(walkData);
		});
	}

}

function display_walk_info(walk_info) {
	$('#walk-info-modal').modal('open');

	$('.dyn_location').val(walk_info["destination_name"]);
	var dyn_src = "https://maps.googleapis.com/maps/api/staticmap?center="+walk_info["start_latitude"] + "," + walk_info["start_longitude"] + "&zoom=15&size=450x300&markers=color:0x2196F3%7Clabel:S%7C"+walk_info["end_latitude"] + "," + walk_info["end_longitude"] + "&markers=color:0xE74C3C%7Clabel:D%7C40.60506,-75.387174&key=AIzaSyBn3v_1yzu_bEKpxBUCPKtQVJngCYoamgE";
	$('.dyn_map').attr("src", dyn_src);
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