angular
.module('starter')
.controller('loginController', loginController);

loginController.$inject = ['$scope', '$stateParams', '$state', 'userAuthenticationService', '$rootScope', '$ionicModal', 'userInfoService'];

function loginController($scope, $stateParams, $state, userAuthenticationService, $rootScope, $ionicModal, userInfoService) {
     var vm = this;
     vm.signInWithEmail = signInWithEmail;
     vm.signInWithFacebook = signInWithFacebook;
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




function newSignInWithEmail (){
  $scope.modal.hide();
   $state.go('app.signUp');
 }
  


}

