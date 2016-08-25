angular
.module('starter')
.factory('activityService', activityService);

activityService.$inject = ['$http', '$q', 'constantsService'];

function activityService($http, $q, constantsService) {
    var service = {
        
        getRecurrence: getRecurrence,
        addNewActivity: addNewActivity
      


    };

    return service;

    function getRecurrence(){
    	var deferred = $q.defer();
        $http({
            method : 'GET',
            url :  constantsService.url+'/presets/Recurrence'
        }).then(function(data){
            deferred.resolve(data);
        }, function(error){
            console.log('error',error);
            deferred.reject(error);
        });
        return deferred.promise;
    }

    function addNewActivity(newActivityDetail){
    	console.log('data from controller',newActivityDetail);
        var deferred = $q.defer();
        $http({
            method : 'POST',
            url :  constantsService.url+'/activities',
            data : newActivityDetail
        }).then(function(data){
            console.log('newactivity return',data);
            deferred.resolve(data);
        }, function(error){
            console.log('error',error);
            deferred.reject(error);
        });
        return deferred.promise;
    }
    
}