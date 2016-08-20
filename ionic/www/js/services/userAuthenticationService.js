angular
.module('starter')
.factory('userAuthenticationService', userAuthenticationService);

userAuthenticationService.$inject = ['$http', '$q', 'constantsService'];

function userAuthenticationService($http, $q, constantsService) {
    var service = {
        emailauthentication: emailauthentication,
    };

    return service;

    function emailauthentication(email){
        var deferred = $q.defer();
        console.log(constantsService.url)
        console.log('service',email);
        $http({
            method : 'GET',
            url : constantsService.url+'/users?Email='+email
        }).then(function(data){
            console.log(data);
            deferred.resolve(data);
        }, function(error){
            console.log('error',error);
            deferred.reject(error);
        });
        return deferred.promise;
    }
}