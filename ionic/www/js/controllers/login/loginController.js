angular
.module('starter')
.controller('loginController', loginController);

loginController.$inject = ['$scope', '$stateParams', '$state', 'userAuthenticationService', '$ionicModal', 'userInfoService', '$ionicHistory','$localStorage' ,'$rootScope','constantsService'];

function loginController($scope, $stateParams, $state, userAuthenticationService, $ionicModal, userInfoService, $ionicHistory,$localStorage,$rootScope,constantsService) {
  var vm = this;

  vm.signInWithEmail = signInWithEmail;
  vm.signInWithFacebook = signInWithFacebook;
  vm.popupForEmailLogin =  popupForEmailLogin;
  vm.closeModel =  closeModel;
  vm.newSignInWithEmail = newSignInWithEmail;
  vm.signInWithGoogle = signInWithGoogle;


  $scope.signedIn = false;
  $rootScope.email = [];
  $rootScope.fbResponse = [];

  function signInWithFacebook(){
    FB.login(function(response) {
      if (response.authResponse) {
        console.log('Welcome!  Fetching your information.... ');
        FB.api('/me',{fields: 'last_name,name,email,gender'}, function(response) {
          console.log('Good to see you, ' + response.name + '.');
          console.log('response',response);
          $rootScope.email = [];
          $rootScope.fbResponse = response;

          userInfoService.findUserByFacebookID(response.id).then(function (res){
            console.log("facebook res",res);
            console.log('res.data[0].email ',res.data[0].email != "");
            if(res.data[0].email != ""){
              routingTONextPage(res,res.data[0].email);
            }else{
              newSignInWithEmail();
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
    $scope.modal.hide();
    console.log('vm.email',vm.email);
    userAuthenticationService.emailauthentication(vm.email).then(function(userData){

      if(userData.data.length != 0){
        routingTONextPage(userData,vm.email);
      }else{
        console.log('invalid user');
        $rootScope.email = vm.email;
        newSignInWithEmail();

      }

    },function(error){
      console.log(error);
    });
  }


  function popupForEmailLogin(){
    $ionicModal.fromTemplateUrl('emailSigninPopUp.html', {
      scope: $scope,
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



  function newSignInWithEmail (userData){
    $ionicHistory.nextViewOptions({
      disableBack: true
    });
    $state.go('app.signUp');
  }


  function routingTONextPage(userData,email){
    console.log("routing fun")
    if((userData.data[0].Email == null || "") || (userData.data[0].Name == null || "") || (userData.data[0].Phone == null || "") || (userData.data[0].Role
      == null || "") || (userData.data[0].Address.Postal_code == null || "")){
      $state.go('app.signUp');
    $localStorage.update = email;
  }else{
    $localStorage.userInfo = userData;
    console.log("this s local storage", $localStorage.userInfo);
    $ionicHistory.nextViewOptions({
      disableBack: true
    });

    if(userData.data[0].Role == 'Student'){
      $state.go('app.student');
    }else{
      $state.go('app.organizer');
    }
  }
}

function signInWithGoogle(){
  gapi.signin.render('signInButton',
  {
    'callback': $scope.signInCallback, 
    'clientid': constantsService.googleId, 
    'requestvisibleactions': 'http://schemas.google.com/AddActivity', 
    'scope': 'https://www.googleapis.com/auth/plus.login https://www.googleapis.com/auth/userinfo.email',
    'cookiepolicy': 'single_host_origin'
  }
  );
}







$scope.signInCallback = function(authResult) {
  $scope.$apply(function() {
    if(authResult['access_token']) {
      $scope.signedIn = true;
      gapi.client.request(
      {
        'path':'/plus/v1/people/me',
        'method':'GET',
        'callback': $scope.userInfoCallback
      }
      );

    } else if(authResult['error']) {
      $scope.signedIn = false;

    }
  });
};





$scope.userInfoCallback = function(userInfo) {
  console.log("userInfouserInfo",userInfo);
  $rootScope.googleInfo = [];


  console.log("  $rootScope.googleInfo",  $rootScope.googleInfo);
  userAuthenticationService.emailauthentication(userInfo.emails[0].value).then(function(userData){

    if(userData.data.length != 0){
      console.log("ssss",userData);
      routingTONextPage(userData,userInfo.emails[0].value);
    }else{
      console.log('invalid user');
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



}

