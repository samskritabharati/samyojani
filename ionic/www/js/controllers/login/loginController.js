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
     vm.popupForEmailLogin =  popupForEmailLogin;
     vm.closeModel =  closeModel;
     vm.newSignInWithEmail = newSignInWithEmail;


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

  var placeSearch, autocomplete;
     function signInWithEmail(){
      $scope.modal.hide();
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
                         $state.go('app.organizer');
                    }
               }else{
                    console.log('invalid user');
                   newSignInWithEmail();
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

                    
      function popupForEmailLogin(){
        $ionicModal.fromTemplateUrl('emailSigninPopUp.html', {
           scope: $scope,
           animation: 'slide-in-right'
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


/*google.maps.event.addDomListener(document.getElementById('autocomplete'), 'focus', geolocate); 
*/

function newSignInWithEmail (){
   userAuthenticationService.getProfession().then(function(userProfession){
                         console.log('getProfession',userProfession)
                         vm.userProfessionList = userProfession;
                    },function(error){
                         console.log(error);
                    })

                    var componentForm = {
                         street_number: 'short_name',
                         route: 'long_name',
                         locality: 'long_name',
                         administrative_area_level_1: 'short_name',
                         country: 'long_name',
                         postal_code: 'short_name'
                    };

                    $ionicModal.fromTemplateUrl('EmailNewSignin.html', {
                         scope: $scope,
                         animation: 'slide-in-up'
                    }).then(function(modal) {
                         $scope.modal = modal;
                         $scope.modal.show();
                         initAutocomplete();
                    });
                        
                    $scope.closeModal = function() {
                      $scope.modal.hide();
                    };
               
                    function initAutocomplete() {   
                        /* autocomplete = new google.maps.places.Autocomplete((document.getElementById('autocomplete')),
                         {types: ['geocode']})*/;
                         autocomplete = new google.maps.places.Autocomplete(
      (document.getElementById('autocomplete')), {
        types: ['geocode']
      });
                         google.maps.event.addDomListener(document.getElementById('autocomplete'), 'focus', geolocate); 

                      autocomplete.addListener('place_changed',  function() {
                        alert("succcc")
                      });
                    }

                    function fillInAddress() {
                         console.log('fillInAddress');
                      // Get the place details from the autocomplete object.
                      var place = autocomplete.getPlace();
                      console.log('place')

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



}

