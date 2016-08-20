angular
.module('starter')
.factory('userAuthenticationService', userAuthenticationService);

userAuthenticationService.$inject = ['$http', '$q', 'constantsService'];

function userAuthenticationService($http, $q, constantsService) {
    var service = {
        emailauthentication: emailauthentication,
        getProfession: getProfession
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
}