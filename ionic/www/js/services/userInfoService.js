angular
.module('starter')
.factory('userInfoService', userInfoService);

userInfoService.$inject = ['$http', '$q', 'constantsService'];

function userInfoService($http, $q, constantsService) {
    var service = {
        getUserActivities: getUserActivities,
        getActivityCoordinatorDetail: getActivityCoordinatorDetail,
        getActivityProjectDetail: getActivityProjectDetail,
        updateActivity:updateActivity
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
        console.log('i am hear');
        var deferred = $q.defer();
        $http({
            method : 'PUT',
            url :  constantsService.url+'/activities/57adeea682e6471aebcb5431',
            data : {"Activity_type_id": "shibiram", "Coordinator_url": "/users/57adeea682e6471aebcb54da", "Name": "Bhaashaa", "End_date": "2011-04-25", "URL": "", "Start_time": "full day", "Project_url": "/projects/57adeea682e6471aebcb5598", "Email": "", "Recurrence": "daily", "Phone": "", "End_time": "", "_url": "/activities/57adeea682e6471aebcb5431", "Address": {"City": "Indore", "District": "Indore", "Locality": null, "Country": "India", "Pincode": "0", "State": "Madhya Pradesh", "Line 1": "", "Line 2": ""}, "SB_Region": "World/India", "Start_date": "2011-04-19"}
        }).then(function(data){
            console.log('update data',data);
            deferred.resolve(data);
        }, function(error){
            console.log('error',error);
            deferred.reject(error);
        });
        return deferred.promise;
    }
}