angular
.module('starter')
.controller('loginController', loginController);

loginController.$inject = ['$scope', '$stateParams', '$state', 'userAuthenticationService', '$ionicModal', 'userInfoService', '$ionicHistory','$localStorage' ,'$rootScope'];

function loginController($scope, $stateParams, $state, userAuthenticationService, $ionicModal, userInfoService, $ionicHistory,$localStorage,$rootScope) {
     var vm = this;

     vm.signInWithEmail = signInWithEmail;
     vm.signInWithFacebook = signInWithFacebook;
     vm.popupForEmailLogin =  popupForEmailLogin;
     vm.closeModel =  closeModel;
     vm.newSignInWithEmail = newSignInWithEmail;
/*   vm.onSignIn = onSignIn;*/
 /* vm.googleSignIn = googleSignIn;*/
    /* vm.onSignIn  = onSignIn;*/
    vm.onSignIn = onSignIn;
vm.onSignInButtonClick = onSignInButtonClick;
    function signInWithFacebook(){
          FB.login(function(response) {
               if (response.authResponse) {
                    console.log('Welcome!  Fetching your information.... ');
                    FB.api('/me',{fields: 'last_name,name,email,gender'}, function(response) {
                         console.log('Good to see you, ' + response.name + '.');
                         console.log('response',response);

                        $rootScope.fbResponse = response;
                         $state.go('app.signUp');
                    });
               } else {
                    console.log('User cancelled login or did not fully authorize.');
               }
          });
     }

     function signInWithEmail(){
      $scope.modal.hide();
          console.log('vm.email',vm.email);
          userAuthenticationService.emailauthentication(vm.email).then(function(userData){
               console.log('userData',userData);
               console.log('userData.lenth',userData.data.length)
               $localStorage.userInfo = userData;
               console.log('local',$localStorage.userInfo);
               console.log(userData.data.length != 0);
               if(userData.data.length != 0){
                    console.log(userData.data[0].Role);
                    console.log('name',(userData.data[0].Name == null || userData.data[0].Name == "" ));
                    console.log((userData.data[0].Email == null || userData.data[0].Email == "" ) || (userData.data[0].Phone == null || userData.data[0].Phone == "" ) || (userData.data[0].Name == null || userData.data[0].Name == "" ));
                     
                    if((userData.data[0].Email == null || "") || (userData.data[0].Name == null || "") || (userData.data[0].Phone == null || "") || (userData.data[0].Role
                        == null || "") || (userData.data[0].Address.Postal_code == null || "")){
                        $state.go('app.signUp',{'email':vm.email},{location: false, inherit: false});
                    }else{
                      $ionicHistory.nextViewOptions({
                        disableBack: true
                      });

                      if(userData.data[0].Role == 'Student'){
                         $state.go('app.student', { 'userdata': userData.data[0].Name});
                      }else{
                         $state.go('app.organizer');
                      }
                    }
                    
               }else{
                  console.log('invalid user');
                   newSignInWithEmail();
                  
               }

          },function(error){
               console.log(error);
          });
     }

                    
      function popupForEmailLogin(){
        $ionicModal.fromTemplateUrl('emailSigninPopUp.html', {
           scope: $scope,
           // animation: 'slide-in-right'
          }).then(function(modal) {
            $scope.modal = modal;
            $scope.modal.show();
           
          });
              
          $scope.closeModal = function() {
            $scope.modal.hide();
          };
        }
         
        function closeModel(){
          $scope.modal.hide();
        }        

function onSignIn(googleUser) {
    console.log("entered onsignin");
    var profile = googleUser.getBasicProfile();
    var id_token = googleUser.getAuthResponse().id_token;
    console.log('ID: ' + profile.getId());
    console.log('Full Name: ' + profile.getName());

    var user_parms = { 
        'auth_src' : 'google',
        'name' : profile.getName(),                                 
        'email' : profile.getEmail(),
        
    }; 

    $.post('/login', user_parms, function(data) {
        console.log("Logged in successfully.");
        var data = JSON.parse(data);
        if (mychkstatus(data)) {
            res = data['result'];
        }
        else {
        }
        
        /*
        if (data.redirect) {
            window.location.href = data.redirect;
        }
        else {
            console.log("no redirect from server");
        }
        */
    });
}


function newSignInWithEmail (){
  $scope.modal.hide();
   $state.go('app.signUp');
 }
  
/*function onSignIn(res){
  console.log("cal");
  console.log("res",res);
}*/
function onSignIn(response){
  console.log("function cal");
                    console.log(response);
  }

  function onSignInButtonClick(){//add a function to the controller so ng-click can bind to it
        GoogleAuth.signIn().then(function(response){//request to sign in
            $scope.callback({response:response});
            console.log("directive",response);
        });
    };
 $scope.signedIn = false;
 
    // Here we do the authentication processing and error handling.
    // Note that authResult is a JSON object.
    $scope.processAuth = function(authResult) {
        // Do a check if authentication has been successful.
        if(authResult['access_token']) {
            // Successful sign in.
            $scope.signedIn = true;
 
            //     ...
            // Do some work [1].
            //     ...
        } else if(authResult['error']) {
            // Error while signing in.
            $scope.signedIn = false;
 
            // Report error.
        }
    };
 
    // When callback is received, we need to process authentication.
    $scope.signInCallback = function(authResult) {
        $scope.$apply(function() {
            $scope.processAuth(authResult);
        });
    };
 
    // Render the sign in button.
    $scope.renderSignInButton = function() {
        gapi.signin.render('signInButton',
            {
                'callback': $scope.signInCallback, // Function handling the callback.
                'clientid': '263423522351-9je87ajk003c55riacpphn7hk3dlh5hn', // CLIENT_ID from developer console which has been explained earlier.
                'requestvisibleactions': 'http://schemas.google.com/AddActivity', // Visible actions, scope and cookie policy wont be described now,
                                                                                  // as their explanation is available in Google+ API Documentation.
                'scope': 'https://www.googleapis.com/auth/plus.login https://www.googleapis.com/auth/userinfo.email',
                'cookiepolicy': 'single_host_origin'
            }
        );
    }
 
    // Start function in this example only renders the sign in button.
    $scope.start = function() {
        $scope.renderSignInButton();
    };
 
    // Call start function on load.
    $scope.start();
}

