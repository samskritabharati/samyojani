angular.module('starter')
	.directive('googleSignInButton',function(){
                return {
                    scope:{
                        gClientId:'@',
                        callback: '&onSignIn'
                    },
                    template: '<button ng-click="onSignInButtonClick()">Sign in</button>',
                    controller: ['$scope','$attrs',function($scope, $attrs){
                        gapi.load('auth2', function() {//load in the auth2 api's, without it gapi.auth2 will be undefined
                            gapi.auth2.init(
                                    {
                                        client_id: $attrs.gClientId
                                    }
                            );
                            var GoogleAuth  = gapi.auth2.getAuthInstance();//get's a GoogleAuth instance with your client-id, needs to be called after gapi.auth2.init
                            $scope.onSignInButtonClick=function(){//add a function to the controller so ng-click can bind to it
                                GoogleAuth.signIn().then(function(response){//request to sign in
                                    $scope.callback({response:response});
                                    console.log("directive",response);
                                },function(err){
                                	console.log("err in googleSignInButton",err);
                                });
                            };
                        });
                    }]
                };
})