		
	function onSignIn(googleUser) {
			  var profile = googleUser.getBasicProfile();
			  var id_token = googleUser.getAuthResponse().id_token;
			   document.getElementById("message").innerHTML = "hi Mr." + profile.getName() + "!<br>";
		$(function() {
		    
		      $.getJSON($SCRIPT_ROOT + '/login', {
			email: profile.getEmail()
		      
		      });
		      return false;
		   
		  });
		          
			}
		function signOut() {
		    var auth2 = gapi.auth2.getAuthInstance();
		    var profile;
			if (auth2.isSignedIn.get()) {
				  profile = auth2.currentUser.get().getBasicProfile();
				  console.log('ID: ' + profile.getId());
				  console.log('Full Name: ' + profile.getName());
				  console.log('Given Name: ' + profile.getGivenName());
				  console.log('Family Name: ' + profile.getFamilyName());
				  console.log('Image URL: ' + profile.getImageUrl());
				  console.log('Email: ' + profile.getEmail());
				      auth2.signOut().then(function () {
				      console.log('User signed out.');
				      document.getElementById("message").innerHTML = "Bye Mr." + profile.getName() + "!<br>";
				    });
				}



		  }	

 // This is called with the results from from FB.getLoginStatus().
  function statusChangeCallback(response) {
    console.log('statusChangeCallback');
    console.log(response);
   
    if (response.status === 'connected') {
      // Logged into your app and Facebook.
	      
	testAPI();
	show = false;
    } else if (response.status === 'not_authorized') {
      // The person is logged into Facebook, but not your app.
	show = true;
      document.getElementById('status').innerHTML = 'Please log ' +
        'into this app.';
    } else {
      	show = true;
      document.getElementById('status').innerHTML = 'Please log ' +
        'into Facebook.';
    }
  }

  
  function checkLoginState() {
    FB.getLoginStatus(function(response) {
      statusChangeCallback(response);
    });
  }

  window.fbAsyncInit = function() {
  FB.init({
    appId      : '1611634565814061',
    cookie     : true,  // enable cookies to allow the server to access 
                        // the session
    xfbml      : true,  // parse social plugins on this page
    version    : 'v2.5' // use graph api version 2.5
  });

 
  FB.getLoginStatus(function(response) {
    statusChangeCallback(response);
  });

  };

  // Load the SDK asynchronously
  (function(d, s, id) {
    var js, fjs = d.getElementsByTagName(s)[0];
    if (d.getElementById(id)) return;
    js = d.createElement(s); js.id = id;
    js.src = "//connect.facebook.net/en_US/sdk.js";
    fjs.parentNode.insertBefore(js, fjs);
  }(document, 'script', 'facebook-jssdk'));

  
 function testAPI() {
    console.log('Welcome!  Fetching your information.... ');
    FB.api('/me', function(response) {
      console.log('Successful login for: ' + response.name);
      document.getElementById('status').innerHTML =
        'Thanks for logging in, ' + response.name + '!';
	
    });
  }
  function logout(){
FB.logout(function(response) {
  document.getElementById('status').innerHTML ='you are logged out'
});
}
  	


