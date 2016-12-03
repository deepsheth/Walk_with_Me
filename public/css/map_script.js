alert("??");
function initMap() {
	map = new google.maps.Map(document.getElementById('map'), {
	  center: {lat: -34.397, lng: 150.644},
	  zoom: 8
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

function sign_out() {
	firebase.auth().signOut().then(function() {
		window.location.href = "/";
	}, function(error) {
	// An error happened.
	alert("Problem logging out.");
	});	
}


$(document).ready( function() {
	console.log("here");
	// =======================
	// AUTH
	// =======================
	// if (!get_user()) {
	// 	window.location.href = "/";
	// }

	// $('#btn_log_out').click(function() { sign_out(); });
});