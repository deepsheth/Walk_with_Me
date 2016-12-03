function get_user_data(userID,after){
	if (!user){
		var user = firebase.auth().currentUser;
	}
	if (!user){
		console.log("User not signed in");
		return null;
	}

	if (!userID){
		var userID = user.uid;
	}
	var userData = {};
	firebase.database().ref('users/'+userID).once('value').then(function(snapshot){
		userData['name'] = snapshot.val().name;
		userData['school'] = snapshot.val().school;
		userData['email'] = snapshot.val().email;
		userData['posted_walk'] = snapshot.val().posted_walk;
		userData['current_walk'] = snapshot.val().current_walk;
		userData['number_of_walks'] = snapshot.val().number_of_walks;
		var storage = firebase.storage();
		var storageRef = storage.ref();

		//create reference to the location in the database
		var imagesRef = storageRef.child('profile_pictures');

		// Get the user id to use as the unique filename for their profile picture
		var userID = firebase.auth().currentUser.uid;
		var uploadRef = imagesRef.child(userID+'.jpg');

		//pull the image url, and for example I put it into the display_pro_pic div
		uploadRef.getDownloadURL().then(function(url){
			userData['profile_picture'] = url;
			after(userData);
		}).catch(function(error){
			console.log('couldnt get pro-pic, getting default');
			var defaultRef = imagesRef.child('default-user-image.png');
			defaultRef.getDownloadURL().then(function(url){
				userData['profile_picture'] = url;
				after(userData,user);
			}).catch(function(error){console.log(error)});
		});
	});
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
		firebase.database().ref('/posted_walks/' + walkID).once('value').then(function(snapshot) {
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
		firebase.database().ref('past_walks/' + walkID).once('value').then(function(snapshot) {
			walkData['poster_id'] = snapshot.val().poster_id;
			walkData['poster_name'] = snapshot.val().poster_name;
			walkData['poster_num_walks'] = snapshot.val().poster_num_walks;
			walkData['poster_image'] = snapshot.val().poster_image;
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

function getUrlParameter(sParam) {
    var sPageURL = decodeURIComponent(window.location.search.substring(1)),
        sURLVariables = sPageURL.split('&'),
        sParameterName,
        i;

    for (i = 0; i < sURLVariables.length; i++) {
        sParameterName = sURLVariables[i].split('=');

        if (sParameterName[0] === sParam) {
            return sParameterName[1] === undefined ? true : sParameterName[1];
        }
    }
};

