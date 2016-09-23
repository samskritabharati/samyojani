angular
.module('starter')
.controller('loginController', loginController);

loginController.$inject = ['$scope', '$stateParams', '$state', 'userAuthenticationService', '$ionicModal', 'userInfoService', '$ionicHistory','$localStorage' ,'$rootScope','constantsService','$timeout','$ionicPopup'];

function loginController($scope, $stateParams, $state, userAuthenticationService, $ionicModal, userInfoService, $ionicHistory,$localStorage,$rootScope,constantsService,$timeout,$ionicPopup ) {
    var vm = this;

    vm.signInWithEmail = signInWithEmail;
    vm.signInWithFacebook = signInWithFacebook;
    vm.popupForEmailLogin =  popupForEmailLogin;
    vm.popupForPhoneLogin =  popupForPhoneLogin;
    vm.closeModel =  closeModel;
    vm.newSignInWithEmail = newSignInWithEmail;
    vm.signInWithGoogle = signInWithGoogle;
    vm.newDirectSignUp = newDirectSignUp;
    vm.signInWithPhone = signInWithPhone;
    vm.signInWithPhoneNumber = signInWithPhoneNumber;

    $scope.signedIn = false;
    vm.showSpinner = false;
    $rootScope.currentMenu = 'home';
    $rootScope.email = [];
    $rootScope.fbResponse = [];
    $localStorage.update= [];
    $rootScope.userPhone = [];

    $scope.$watch(function() { return   $localStorage.userlogin },
        function() {      
            if($localStorage.userlogin){
                vm.hideSignIn = false;
            }else{
                vm.hideSignIn = true
            }
        }) 


    function signInWithFacebook(){
        vm.showSpinner = true;
        FB.login(function(response) {
            if (response.authResponse) {
                FB.api('/me',{fields: 'last_name,name,email,gender'}, function(response) {
                    $rootScope.email = [];
                    $rootScope.fbResponse = response;

                    userInfoService.findUserByFacebookID(response.id).then(function (res){
                        if(res.data.length>0){
                            if(res.data[0].Email != ""){
                                routingTONextPage(res,res.data[0].Email);
                            }else{

                                newSignInWithEmail();
                            }

                        }else{
                            $ionicModal.fromTemplateUrl('Enteremailpopup.html', {
                                scope: $scope,
                            }).then(function(modal) {
                                $scope.modal = modal;
                                vm.showSpinner = false;
                                $scope.modal.show();

                            });

                            $scope.closeModal = function() {
                                $scope.modal.hide();
                            };
                        }

                    },function(error){
                        console.log("Error in getting user info by facebook id",error)
                    })


                });
            } else {
                console.log('User cancelled login or did not fully authorize.');
            }
        });
    }

    function signInWithEmail(){
        if(vm.email){
            vm.showSpinner = true;
            userAuthenticationService.emailauthentication(vm.email).then(function(userData){
                if(userData.data.length != 0){
                    console.log("1st calll")
                    routingTONextPage(userData,vm.email);
                }else{

                    $ionicModal.fromTemplateUrl('EnterPhonepopup.html', {
                        scope: $scope,
                    }).then(function(modal) {
                        $scope.modal = modal;
                        vm.showSpinner = false;
                        $scope.modal.show();

                    });
                }

            },function(error){
                console.log(error);
            });
        }

    }


    function popupForEmailLogin(){
     /* var alertPopup = $ionicPopup.alert({
                title: '<b>' + 'login' + '</b>',
                template: ''

            });
     $(".popup-buttons").addClass("displayNone");
           
 $timeout(function () {   alertPopup.close()}, 1000); */
     
   $("#emailSigninPopUp").slideToggle(600);
    }

    function popupForPhoneLogin(){
/*console.log("vm.phonenumberformate",$("#demo").val());
        var extension = $("#demo").intlTelInput("getExtension");

console.log('extension',extension);

var intlNumber = $("#demo").intlTelInput("getNumber");

 console.log('intlNumber',intlNumber);



var numberType = $("#demo").intlTelInput("getNumberType");
console.log('numberType',numberType);
*/

      $("#phonetogglediv").slideToggle(600);
    }

    function closeModel(){
        $scope.modal.hide();
    }        

    function newSignInWithEmail (){

        $ionicHistory.nextViewOptions({
            disableBack: true
        });
        $state.go('app.signUp');
    }

    function newDirectSignUp (){
        $ionicHistory.nextViewOptions({
            disableBack: true
        });
        $state.go('app.signUp');
    }


    function routingTONextPage(userData,email){
        vm.showSpinner = true;
        if(userData.data[0].Email == null || userData.data[0].Name == null || userData.data[0].Phone == null  || userData.data[0].Address.Postal_code == null){
            $localStorage.update = email;
            vm.showSpinner = false;
            $ionicHistory.nextViewOptions({
                disableBack: true
            });
            $state.go('app.signUp');
        }else{
            if($rootScope.fbResponse.length > 0) {
                if(!(userData.data[0].Facebook_id)){
                    userData.data[0].Facebook_id = $rootScope.fbResponse.id;
                    userInfoService.updateUserDetail(userData.data[0]).then(function(userUpdateddata){
                        console.log("facebook id updated");
                        vm.showSpinner = false;
                    },function(error){
                        console.log("Error in updating FacebookID")
                    })
                }
            }
            $localStorage.userInfo = userData;
            vm.showSpinner = false;
            $ionicHistory.nextViewOptions({
                disableBack: true
            });
            if(userData.data[0].Role == 'Student'){
                $state.go('app.student');
            }else{
                if(userData.data[0].Role == null){
                    $state.go('app.student');
                }else{
                    $state.go('app.organizer');
                }
            }
        }
    }

    function signInWithGoogle(){
        vm.showSpinner = true;
         $scope.start();
       /*gapi.signin.render('signInButton',
        {
            'callback': $scope.signInCallback, 
            'clientid': constantsService.googleId, 
            'requestvisibleactions': 'http://schemas.google.com/AddActivity', 
            'scope': 'https://www.googleapis.com/auth/plus.login https://www.googleapis.com/auth/userinfo.email',
            'cookiepolicy': 'single_host_origin',
            'immediate': false

        }
        );*/
         /*gapi.auth.authorize(
            {
               
                'clientid': constantsService.googleId, 
                'requestvisibleactions': 'http://schemas.google.com/AddActivity', 
                'scope': 'https://www.googleapis.com/auth/plus.login https://www.googleapis.com/auth/userinfo.email',
                'cookiepolicy': 'single_host_origin',
                'immediate': false

            },$scope.signInCallback
        );*/
    }


    $scope.signInCallback = function(authResult) {
        console.log("cal back",authResult);
        $scope.$apply(function() {
            if(authResult['access_token']) {
                $scope.signedIn = true;
                gapi.client.request(
                {
                    'path':'/plus/v1/people/me',
                    'method':'GET',
                    'callback': $scope.userInfoCallback,
                }
                );

            } else if(authResult['error']  == "immediate_failed") {
                console.log("eeee");

                $scope.signedIn = false;
               
                    /*    if (authRes['status']['signed_in']) {
                            $scope.signedIn = true;
                gapi.client.request(
                {
                    'path':'/plus/v1/people/me',
                    'method':'GET',
                    'immediate': true,
                    'callback': $scope.userInfoCallback,
                }
                );

                        }*/
              

            }
        });
    };

    $scope.userInfoCallback = function(userInfo) {
        $rootScope.googleInfo = [];
        userAuthenticationService.emailauthentication(userInfo.emails[0].value).then(function(userData){
            if(userData.data.length != 0){
                routingTONextPage(userData,userInfo.emails[0].value);
            }else{
                $rootScope.googleInfo = {
                    email: userInfo.emails[0].value,
                    name : userInfo.name.givenName + userInfo.name.familyName
                }
                newSignInWithEmail();

            }

        },function(error){
            console.log(error);
        });
    };

    function signInWithPhoneNumber(){
        $scope.modal.hide();
        signInWithPhone();
    }
    function signInWithPhone(){
        if(vm.phone){
            $rootScope.userPhone = vm.phone;
            userAuthenticationService.phoneauthentication(vm.phone).then(function(userData){
                if(userData.data.length > 0){
                    if(userData.data[0].Email == null){
                        routingTONextPage(userData,vm.email);
                    }else{

                        routingTONextPage(userData,userData.data[0].Email);
                    }
                }else{
                    $rootScope.email = vm.email;
                    newSignInWithEmail();
                }

            })
        }
    }

       $scope.signedIn = false;
 
   
    $scope.processAuth = function(authResult) {
        // Do a check if authentication has been successful.
        if(authResult['access_token']) {
            // Successful sign in.
            $scope.signedIn = true;
  gapi.client.request(
                {
                    'path':'/plus/v1/people/me',
                    'method':'GET',
                    'callback': $scope.userInfoCallback,
                }
                );
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
                'clientid': constantsService.googleId, // CLIENT_ID from developer console which has been explained earlier.
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
   


}

