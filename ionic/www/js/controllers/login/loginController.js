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
    vm.newDirectSignUp = newDirectSignUp;
    $scope.signedIn = false;
    vm.showSpinner = false;
    $rootScope.currentMenu = 'home';
    $rootScope.email = [];
    $rootScope.fbResponse = [];
    $localStorage.update= [];

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
        
        console.log("vm.email",vm.email);
        /*$scope.modal.hide();*/
        if(vm.email){
            vm.showSpinner = true;
            userAuthenticationService.emailauthentication(vm.email).then(function(userData){
                if(userData.data.length != 0){
                    routingTONextPage(userData,vm.email);
                }else{
                    $rootScope.email = vm.email;
                    newSignInWithEmail();
                }

            },function(error){
                console.log(error);
            });
        }

    }


    function popupForEmailLogin(){
        $("#emailSigninPopUp").slideToggle(600);
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
        /* $scope.modal.hide();*/
        $ionicHistory.nextViewOptions({
            disableBack: true
        });
        $state.go('app.signUp');
    }


    function routingTONextPage(userData,email){
        vm.showSpinner = true;
        if(userData.data[0].Email == null || userData.data[0].Name == null || userData.data[0].Phone == null  || userData.data[0].Address.Postal_code == null){
            console.log("if")
        }
       
        if(userData.data[0].Email == null || userData.data[0].Name == null || userData.data[0].Phone == null  || userData.data[0].Address.Postal_code == null){
            console.log("error");
            $localStorage.update = email;
        vm.showSpinner = false;
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
                $state.go('app.organizer');
            }
        }
    }

    function signInWithGoogle(){
        vm.showSpinner = true;
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



}

