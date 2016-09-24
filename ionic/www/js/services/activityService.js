angular
.module('starter')
.factory('activityService', activityService);

activityService.$inject = ['$http', '$q', 'constantsService'];

function activityService($http, $q, constantsService) {
    var service = {
        getRecurrence: getRecurrence,
        addNewActivity: addNewActivity,
        joinActivity: joinActivity,
        getActivityByUrl: getActivityByUrl,
        deletActivityFromUserList: deletActivityFromUserList,
        updateActivity: updateActivity,
        getActivityParticipants: getActivityParticipants,
        getEventRole: getEventRole,
        getAllDays: getAllDays,
        searchForActivity: searchForActivity,
        getPartcipantFromActivity:getPartcipantFromActivity
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
        var deferred = $q.defer();
        $http({
            method : 'POST',
            url :  constantsService.url+'/activities',
            data : newActivityDetail
        }).then(function(data){
            deferred.resolve(data);
        }, function(error){
            console.log('error',error);
            deferred.reject(error);
        });
        return deferred.promise;
    }

    function joinActivity(newJoindActivity){
        var deferred = $q.defer();
        $http({
            method : 'POST',
            url :  constantsService.url+'/roles?Person_url='+newJoindActivity.Person_url,
            data: newJoindActivity
        }).then(function(data){
            deferred.resolve(data);
        }, function(error){
            console.log('error',error);
            deferred.reject(error);
        });
        return deferred.promise;
    }

    function getActivityByUrl(activityUrl){
        var deferred = $q.defer();
        $http({
            method : 'GET',
            url :  constantsService.url+activityUrl
        }).then(function(data){
            deferred.resolve(data);
        }, function(error){
            console.log('error',error);
            deferred.reject(error);
        });
        return deferred.promise;
    }

    function deletActivityFromUserList(roleurl){
        var deferred = $q.defer();
        $http({
            method : 'DELETE',
            url :  constantsService.url+roleurl
        }).then(function(data){
            deferred.resolve(data);
        }, function(error){
            console.log('error',error);
            deferred.reject(error);
        });
        return deferred.promise;
    }

    function updateActivity(newJoindActivity,roleurl){
        var deferred = $q.defer();
        $http({
            method : 'PUT',
            url :  constantsService.url+roleurl,
            data: newJoindActivity
        }).then(function(data){
            deferred.resolve(data);
        }, function(error){
            console.log('error',error);
            deferred.reject(error);
        });
        return deferred.promise;
    }

    function getActivityParticipants(activityUrl){
        var deferred = $q.defer();
        $http({
            method : 'GET',
            url :  constantsService.url+'/roles?Activity_url='+activityUrl+'&exact=1'
        }).then(function(data){
            deferred.resolve(data);
        }, function(error){
            console.log('error',error);
            deferred.reject(error);
        });
        return deferred.promise;
    }

    function getEventRole(){
        var deferred = $q.defer();
        $http({
            method : 'GET',
            url : constantsService.url+'/presets/EventRole'
        }).then(function(data){
            deferred.resolve(data);
        }, function(error){
            console.log('error',error);
            deferred.reject(error);
        });
        return deferred.promise;
    }

    function getAllDays(){
        var deferred = $q.defer();
        $http({
            method : 'GET',
            url :  constantsService.url+'/presets/Days'
        }).then(function(data){
            deferred.resolve(data);
        }, function(error){
            console.log('error',error);
            deferred.reject(error);
        });
        return deferred.promise;
    }

    function searchForActivity(searchCriteria){
        var deferred = $q.defer();
        $http({
            method : 'GET',
            url : constantsService.url+'/activities?State='+searchCriteria.state+'&City='+searchCriteria.city
        }).then(function(data){
            deferred.resolve(data);
        }, function(error){
            console.log('error',error);
            deferred.reject(error);
        });
        return deferred.promise;
    }

    function getPartcipantFromActivity(activityUrl,personUrl){
        var deferred = $q.defer();
        $http({
            method : 'GET',
            url : constantsService.url+'/roles?Activity_url='+activityUrl+'&Person_url='+personUrl
        }).then(function(data){
            deferred.resolve(data);
        }, function(error){
            console.log('error',error);
            deferred.reject(error);
        });
        return deferred.promise;
    }
}