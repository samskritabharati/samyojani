angular
.module('starter')
.controller('loginController', loginController);

loginController.$inject = ['$scope', '$stateParams', '$state', 'userAuthenticationService', '$rootScope', '$ionicModal', 'userInfoService'];

function loginController($scope, $stateParams, $state, userAuthenticationService, $rootScope, $ionicModal, userInfoService) {
     var vm = this;
     vm.signInWithEmail = signInWithEmail;
     vm.signInWithFacebook = signInWithFacebook;
     vm.addUser = addUser;
     vm.geolocate = geolocate;


     function signInWithFacebook(){
          FB.login(function(response) {
               if (response.authResponse) {
                    console.log('Welcome!  Fetching your information.... ');
                    FB.api('/me',{fields: 'last_name,name,email,gender'}, function(response) {
                         console.log('Good to see you, ' + response.name + '.');
                         console.log('response',response);
                         $state.go('app.student', { 'userdata': response.name});
                    });
               } else {
                    console.log('User cancelled login or did not fully authorize.');
               }
          });
     }

     function signInWithEmail(){
          console.log('vm.email',vm.email);
          userAuthenticationService.emailauthentication(vm.email).then(function(userData){
               console.log('userData',userData);
               console.log('userData.lenth',userData.data.length)
               $rootScope.userDetail = userData;
               console.log(userData.data.length != 0);
               if(userData.data.length != 0){
                    console.log(userData.data[0].Role)

                    if(userData.data[0].Role == 'Student'){
                         $state.go('app.student', { 'userdata': userData.data[0].Name});
                    }else{
                         $state.go('app.organizer', { 'userInfo': userData.data[0].Name});
                    }
               }else{
                    console.log('invalid user');
                    userAuthenticationService.getProfession().then(function(userProfession){
                         console.log('getProfession',userProfession)
                         vm.userProfessionList = userProfession;
                    },function(error){
                         console.log(error);
                    })

                    
                    $ionicModal.fromTemplateUrl('EmailNewSignin.html', {
                         scope: $scope,
                         animation: 'slide-in-up'
                    }).then(function(modal) {
                         $scope.modal = modal;
                         $scope.modal.show();
                    });
                        
                    $scope.closeModal = function() {
                      $scope.modal.hide();
                    };
                    
               }

          },function(error){
               console.log(error);
          });
     }

     function addUser(newUserDetail){
          console.log("detail",newUserDetail);
          userInfoService.addNewUser(newUserDetail).then(function(data){
               console.log(data);
          },function(error){
               console.log('error');
          })

     }

      var placeSearch, autocomplete;

     function geolocate(){
          if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(position) {
      var geolocation = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };
      console.log(geolocation);
      var circle = new google.maps.Circle({
        center: geolocation,
        radius: position.coords.accuracy
      });
      autocomplete.setBounds(circle.getBounds());
    });
  }
     }
initAutocomplete();
    
var componentForm = {
  street_number: 'short_name',
  route: 'long_name',
  locality: 'long_name',
  administrative_area_level_1: 'short_name',
  country: 'long_name',
  postal_code: 'short_name'
};

google.maps.event.addDomListener(document.getElementById('autocomplete'), 'focus', geolocate); 

function initAutocomplete() {
  // Create the autocomplete object, restricting the search to geographical
  // location types.
  autocomplete = new google.maps.places.Autocomplete(
      /** @type {!HTMLInputElement} */(document.getElementById('autocomplete')),
      {types: ['geocode']});

  // When the user selects an address from the dropdown, populate the address
  // fields in the form.
  autocomplete.addListener('place_changed', fillInAddress);
}

function fillInAddress() {
  // Get the place details from the autocomplete object.
  var place = autocomplete.getPlace();

  for (var component in componentForm) {
    document.getElementById(component).value = '';
    document.getElementById(component).disabled = false;
  }

  // Get each component of the address from the place details
  // and fill the corresponding field on the form.
  for (var i = 0; i < place.address_components.length; i++) {
    var addressType = place.address_components[i].types[0];
    if (componentForm[addressType]) {
      var val = place.address_components[i][componentForm[addressType]];
      document.getElementById(addressType).value = val;
    }
  }
}

}

