angular
.module('starter')
.factory('setLocationService', setLocationService);

setLocationService.$inject = ['$http', '$q', 'constantsService'];

function setLocationService($http, $q, constantsService) {
    var setLocation = {
        getAllPraantaType: getAllPraantaType,
        getRegionsByurl : getRegionsByurl,
        addSubRegion : addSubRegion,
        deletRegion: deletRegion
    }

    return setLocation

    function getAllPraantaType(){
    	var deferred = $q.defer();
        $http({
            method : 'GET',
            url :  constantsService.url+'/presets/Praanta_type'
        }).then(function(data){
            deferred.resolve(data);
        }, function(error){
            console.log('error',error);
            deferred.reject(error);
        });
        return deferred.promise;
    }

    function getRegionsByurl(url){
    	var deferred = $q.defer();
        $http({
            method : 'GET',
            url :  constantsService.url+url
        }).then(function(data){
            deferred.resolve(data);
        }, function(error){
            console.log('error',error);
            deferred.reject(error);
        });
        return deferred.promise;
    }

    function addSubRegion(newData){
        var deferred = $q.defer();
        $http({
            method : 'POST',
            url :  constantsService.url+'/regions',
            data: newData
        }).then(function(data){
            deferred.resolve(data);
        }, function(error){
            console.log('error',error);
            deferred.reject(error);
        });
        return deferred.promise;
    }

    function deletRegion(regionurl){
        var deferred = $q.defer();
        $http({
            method : 'DELETE',
            url :  constantsService.url+regionurl
        }).then(function(data){
            deferred.resolve(data);
        }, function(error){
            console.log('error',error);
            deferred.reject(error);
        });
        return deferred.promise;
    }
}