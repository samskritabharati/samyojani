angular
.module('starter')
.factory('userAuthenticationService', userAuthenticationService);

userAuthenticationService.$inject = ['$http', '$q', 'constantsService', '$ionicPopup'];

function userAuthenticationService($http, $q, constantsService, $ionicPopup) {
    var service = {
        emailauthentication: emailauthentication,
        getProfession: getProfession,
        confirm: confirm,
        alertUser: alertUser

    };

    return service;

    function emailauthentication(email){
        var deferred = $q.defer();
        console.log(constantsService.url)
        console.log('service',email);
        $http({
            method : 'GET',
            url : constantsService.url+'/users?Email='+email+'&exact=1'
        }).then(function(data){
            console.log(data);
            deferred.resolve(data);
        }, function(error){
            console.log('error',error);
            deferred.reject(error);
        });
        return deferred.promise;
    }

    function getProfession(){
        var deferred = $q.defer();
        $http({
            method : 'GET',
            url : constantsService.url+'/presets/Profession'
        }).then(function(data){
            console.log(data);
            deferred.resolve(data);
        }, function(error){
            console.log('error',error);
            deferred.reject(error);
        });
        return deferred.promise;
    }

    function confirm(title, alertMsg, cancelText, confirmText, cancelAction, confirmAction){
    var confirmPopup = $ionicPopup.confirm({
      title: title,
      template: alertMsg,
      buttons: [{
        text: cancelText,
        type: 'button-positive',
        onTap: cancelAction

      }, {
          text: confirmText,
          type: 'button-positive',
          onTap: confirmAction
        }]
    });
  } 

   function alertUser(title,className,alertMsg,okAction){
    $ionicPopup.alert({
     title: title,
     cssClass: className,
     template: alertMsg
   }).then(okAction);
  }
}