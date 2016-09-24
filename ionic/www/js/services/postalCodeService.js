angular
.module('starter')
.factory('postalCodeService', postalCodeService);

postalCodeService.$inject = ['$http', '$q', 'constantsService'];

function postalCodeService($http, $q, constantsService) {
    var service = {
        
        getDetailsByPostalCode: getDetailsByPostalCode,
    };

    return service;

    function getDetailsByPostalCode(country,postalCode){
        var deferred = $q.defer();
        $http({
            method : 'GET',
            url :  constantsService.url+'/locations?Country='+country+'&Postal_code='+postalCode
        }).then(function(data){
            deferred.resolve(data);
        }, function(error){
            console.log('error',error);
            deferred.reject(error);
        });
        return deferred.promise;
    }
}
