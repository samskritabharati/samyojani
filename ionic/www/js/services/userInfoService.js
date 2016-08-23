angular
.module('starter')
.factory('userInfoService', userInfoService);

userInfoService.$inject = ['$http', '$q', 'constantsService'];

function userInfoService($http, $q, constantsService) {
    var service = {
        getUserActivities: getUserActivities,
        getActivityCoordinatorDetail: getActivityCoordinatorDetail,
        getActivityProjectDetail: getActivityProjectDetail,
        updateActivity: updateActivity,
        addNewUser: addNewUser,
        deleteActivity: deleteActivity
    };

    return service;

    function getUserActivities(region){
        var deferred = $q.defer();
        $http({
            method : 'GET',
            url : constantsService.url+'/activities?SB_Region='+region
        }).then(function(data){
            deferred.resolve(data);
        }, function(error){
            console.log('error',error);
            deferred.reject(error);
        });
        return deferred.promise;
    }

    function getActivityCoordinatorDetail(Coordinator_url){
        console.log(Coordinator_url);
         var deferred = $q.defer();
        $http({
            method : 'GET',
            url :  constantsService.url+Coordinator_url
        }).then(function(data){
            deferred.resolve(data);
        }, function(error){
            console.log('error',error);
            deferred.reject(error);
        });
        return deferred.promise;
    }

    function getActivityProjectDetail(projecturl){
        console.log(projecturl);
         var deferred = $q.defer();
        $http({
            method : 'GET',
            url :  constantsService.url+projecturl
        }).then(function(data){
            deferred.resolve(data);
        }, function(error){
            console.log('error',error);
            deferred.reject(error);
        });
        return deferred.promise;
    }

    function updateActivity(dataToUpdate){
        console.log('i am hear',dataToUpdate);
        var deferred = $q.defer();
        $http({
            method : 'PUT',
            url :  constantsService.url+dataToUpdate._url,
            data : dataToUpdate
        }).then(function(data){
            console.log('update data',data);
            deferred.resolve(data);
        }, function(error){
            console.log('error',error);
            deferred.reject(error);
        });
        return deferred.promise;
    }

    function addNewUser(newUserDetail){
        var deferred = $q.defer();
        $http({
            method : 'POST',
            url :  constantsService.url+'/users',
            data : newUserDetail
        }).then(function(data){
            console.log('update data',data);
            deferred.resolve(data);
        }, function(error){
            console.log('error',error);
            deferred.reject(error);
        });
        return deferred.promise;
    }

    function deleteActivity(dataToDelete){
        console.log('i am deleting',dataToDelete);
        var deferred = $q.defer();
        $http({
            method : 'DELETE',
            url :  constantsService.url+dataToDelete._url
        }).then(function(data){
            console.log('delete data',data);
            deferred.resolve(data);
        }, function(error){
            console.log('error',error);
            deferred.reject(error);
        });
        return deferred.promise;
    }

}