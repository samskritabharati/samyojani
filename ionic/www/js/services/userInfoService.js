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
        updateUserDetail:updateUserDetail,
        addNewUser: addNewUser,
        deleteActivity: deleteActivity,
        getAllActivity: getAllActivity,
        getUser: getUser,
        getUserRole: getUserRole,
        deleteUser: deleteUser,
        getUserClassList:getUserClassList,
        getUserByUrl: getUserByUrl,
        findUserByFacebookID:findUserByFacebookID,
        getAllCountryList:getAllCountryList,
        searchForUser:searchForUser,
        getUserInterestsList:  getUserInterestsList

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
        var deferred = $q.defer();
        $http({
            method : 'PUT',
            url :  constantsService.url+dataToUpdate._url,
            data : dataToUpdate
        }).then(function(data){
            deferred.resolve(data);
        }, function(error){
            console.log('error',error);
            deferred.reject(error);
        });
        return deferred.promise;
    }

    function updateUserDetail(userdataToUpdate){
        var deferred = $q.defer();
        $http({
            method : 'PUT',
            url :  constantsService.url+userdataToUpdate._url,
            data : userdataToUpdate
        }).then(function(data){
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
            deferred.resolve(data);
        }, function(error){
            console.log('error',error);
            deferred.reject(error);
        });
        return deferred.promise;
    }

    function deleteActivity(dataToDelete){
        var deferred = $q.defer();
        $http({
            method : 'DELETE',
            url :  constantsService.url+dataToDelete._url
        }).then(function(data){
            deferred.resolve(data);
        }, function(error){
            console.log('error',error);
            deferred.reject(error);
        });
        return deferred.promise;
    }

    function getAllActivity(){
         var deferred = $q.defer();
        $http({
            method : 'GET',
            url :  constantsService.url+'/types/activity'
        }).then(function(data){
            deferred.resolve(data);
        }, function(error){
            console.log('error',error);
            deferred.reject(error);
        });
        return deferred.promise;
    }


    function getUser(){
        var deferred = $q.defer();
        $http({
            method : 'GET',
            url : constantsService.url+'/users'
        }).then(function(data){
            deferred.resolve(data);
        }, function(error){
            console.log('error',error);
            deferred.reject(error);
        });
        return deferred.promise;
    }

     function deleteUser(userToDelete){
        var deferred = $q.defer();
        $http({
            method : 'DELETE',
            url :  constantsService.url+userToDelete._url
        }).then(function(data){
            deferred.resolve(data);
        }, function(error){
            console.log('error',error);
            deferred.reject(error);
        });
        return deferred.promise;
    }

    function getUserRole(){
        var deferred = $q.defer();
        $http({
            method : 'GET',
            url : constantsService.url+'/types/role'
        }).then(function(data){
             deferred.resolve(data);
        }, function(error){
            console.log('error',error);
            deferred.reject(error);
        });
        return deferred.promise;
    }

    function getUserClassList(userUrl){
        var deferred = $q.defer();
        $http({
            method : 'GET',
            url : constantsService.url+'/roles?Person_url='+userUrl
        }).then(function(data){
            deferred.resolve(data);
        }, function(error){
            console.log('error',error);
            deferred.reject(error);
        });
        return deferred.promise;
    }

    function getUserByUrl(userUrl){
        var deferred = $q.defer();
        $http({
            method : 'GET',
            url : constantsService.url+userUrl
        }).then(function(data){
            deferred.resolve(data);
        }, function(error){
            console.log('error',error);
            deferred.reject(error);
        });
        return deferred.promise;
    }

    function findUserByFacebookID(facbookID){
        var deferred = $q.defer();
        $http({
            method : 'GET',
            url : constantsService.url+'/users?Facebook_id='+facbookID
        }).then(function(data){
            deferred.resolve(data);
        }, function(error){
            console.log('error',error);
            deferred.reject(error);
        });
        return deferred.promise;
    }
    
    function getAllCountryList(){
        var deferred = $q.defer();
        $http({
            method : 'GET',
            url : constantsService.url+'/presets/Country'
        }).then(function(data){
            deferred.resolve(data);
        }, function(error){
            console.log('error',error);
            deferred.reject(error);
        });
        return deferred.promise;
    }

    function searchForUser(searchCriteria){
        var deferred = $q.defer();
        $http({
            method : 'GET',
            url : constantsService.url+'/users?Name='+searchCriteria.name+'&Email='+searchCriteria.email+'&Phone='+searchCriteria.phone+'&Role='+searchCriteria.role+'&State='+searchCriteria.state+'&Country='+searchCriteria.country+'&AddressString='+searchCriteria.address
        }).then(function(data){
            deferred.resolve(data);
        }, function(error){
            console.log('error',error);
            deferred.reject(error);
        });
        return deferred.promise;
    }

    function getUserInterestsList(){
        var deferred = $q.defer();
        $http({
            method : 'GET',
            url : constantsService.url+'/presets/Interests'
        }).then(function(data){
            deferred.resolve(data);
        }, function(error){
            console.log('error',error);
            deferred.reject(error);
        });
        return deferred.promise;
    }
}