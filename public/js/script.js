
function log_in(email, password) {

	firebase.auth().signInWithEmailAndPassword(email, password).catch(function(error) {
		var error_message = "<div class='row'><div class='col s8 offset-s2'><strong class='red-text'>" + error.message + "</strong></div></div>";
		$('#log_in_panel').before(error_message);
	});

}

function log_in_helper() {
	log_in($('#log_in_username').val(), $('#log_in_password').val());
}

function sign_out() {
	firebase.auth().signOut().then(function() {
		window.location.href = "/";
	}, function(error) {
	// An error happened.
	alert("Problem logging out.");
	});	
}

function create_user(email, password, name) {

	var initUserData = {
			name: name,
			email: email,
			posted_walk: '',
			current_walk: '',
			icon_style: "default",
			number_of_walks: 0
	};

	firebase.auth().createUserWithEmailAndPassword(email, password)
		.then(function() {
			var user = firebase.auth().currentUser;

			firebase.database().ref("users/" + user.uid).set(initUserData).then(function() {
				window.location.href = "/app.html";
			}, function(error) {
				console.log("error: " + error.message);
			});

		}, function(error) {
			var error_message = "<div class='row'><div class='col s8 offset-s2'><strong class='red-text'>" + error.message + "</strong></div></div>";
			$('#log_in_panel').before(error_message);
	});
}

function initMiniMap() {

	$(document).ready( function() {
		map = new google.maps.Map(document.getElementById('mini-map'), {
		  center: {lat: 40.6069, lng: -75.3783},
		  zoom: 17
		});

		// console.log("?");
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

	});
}

$(document).ready( function() {
	// =======================
	// AUTH
	// =======================

	// In case homepage is loaded, redirects to app
	var stop_authStateListener = firebase.auth().onAuthStateChanged(function(user) {
		if (window.location.pathname == "/") {
			if (user) {
				window.location.href = "/app.html";
			} else {
			// No user is signed in.
	  		}
  		}
	});

	// Prevents href redirection
	$('#log_in_panel').submit(function(event) {
		event.preventDefault();
	});

	// Sign In
	$("#btn_log_in").click(function(event) { 
		event.preventDefault();
		log_in_helper(); 
	});

	//  Sign out
	// #('#btn_sign_up').click(function() { sign_out_helper(); });
	$('#btn_log_out').click(function(event) {
		event.preventDefault();
		sign_out(); 
	});

	// Create acct
	$('#btn_create_user').click(function(event) {
		event.preventDefault();

		// To avoid premature redirection
		stop_authStateListener();
		create_user($('#create_username').val(), $('#create_password').val(), $('#create_name').val());
	});

	

	// =======================
	// Dynamic HTML Init
	// =======================
	$(".button-collapse").sideNav();
	$('.tooltipped').tooltip({delay: 30});



	// =======================
	// Past Events Page
	// =======================

	$('#user-profile-picture-image').click(function(){
		
		$('#user-profile-picture-image').attr('src','https://firebasestorage.googleapis.com/v0/b/walk-with-me-2f1f5.appspot.com/o/profile_pictures%2Fdefault-user-image.png?alt=media&token=63589b69-e115-43e5-9248-562eb2f7de2c');
		$('#pro-pic-upload').click();
	});
	$('#pro-pic-upload').change(function() {
		console.log("pro pic clicked");
		var storage = firebase.storage();
		var storageRef = storage.ref();

		//create reference to the location in the database
		var imagesRef = storageRef.child('profile_pictures');
		var selectedFile = $('#pro-pic-upload').get(0).files[0];

		// Get the user id to use as the unique filename for their profile picture
		var userID = firebase.auth().currentUser.uid;
		var uploadRef = imagesRef.child(userID+'.png');

		uploadRef.put(selectedFile).then(function(snapshot) {
			console.log('Profile Picture Uploaded');
		});

		setTimeout(function(){
			var uploadRef = imagesRef.child(userID+'.png');
			uploadRef.getDownloadURL().then(function(url){
			console.log(url);
			$('#user-profile-picture-image').attr('src',url);
			});
		}, 500);
		
	});


});