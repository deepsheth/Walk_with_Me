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
			school: school,
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


$(document).ready( function() {
	// =======================
	// AUTH
	// =======================

	// In case homepage is loaded, redirects to app
	var stop_authStateListener = firebase.auth().onAuthStateChanged(function(user) {
		if (user) {
			window.location.href = "/app.html";
		} else {
		// No user is signed in.
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

});