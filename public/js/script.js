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

function log_in(email, password) {
	firebase.auth().signInWithEmailAndPassword(email, password).catch(function(error) {
		var errorCode = error.code;
		var errorMessage = error.message;
		console.log(error.code);
		console.log(error.message);
	});
}

function sign_out() {
	firebase.auth().signOut().then(function() {
	// Sign-out successful.
	}, function(error) {
	// An error happened.
	alert("Problem logging out.");
	});	
}

function get_user() {
	var user = firebase.auth().currentUser;

	if (user) {
	  return true;
	} else {
	  return false;
	}
}

$(document).ready( function() {
	
	if (!get_user()) {
		
	}
	else {
		alert("User is logged in.");
	}

	$("btn_log_in").click(function() {
		log_in();
	});

	$(".button-collapse").sideNav();
});