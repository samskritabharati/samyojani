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
       /* getAllProject: getAllProject,*/
        getUser: getUser,
        getUserRole: getUserRole,
        deleteUser: deleteUser,
        getUserClassList:getUserClassList,
        getUserByUrl: getUserByUrl


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

    function updateUserDetail(userdataToUpdate){
        console.log('i am hear',userdataToUpdate);
        console.log("userurls",userdataToUpdate._url);
        var deferred = $q.defer();
        $http({
            method : 'PUT',
            url :  constantsService.url+userdataToUpdate._url,
            data : userdataToUpdate
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
        console.log('data from controller',newUserDetail);
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
            console.log(data);
            deferred.resolve(data);
        }, function(error){
            console.log('error',error);
            deferred.reject(error);
        });
        return deferred.promise;
    }

     function deleteUser(userToDelete){
        console.log('i am deleting',userToDelete);
        var deferred = $q.defer();
        $http({
            method : 'DELETE',
            url :  constantsService.url+userToDelete._url
        }).then(function(data){
            console.log('delete data',data);
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
            console.log(data);
             deferred.resolve(data);
        }, function(error){
            console.log('error',error);
            deferred.reject(error);
        });
        return deferred.promise;
    }

    function getUserClassList(userUrl){
        console.log("userUrl",userUrl);
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
         console.log("userUrl",userUrl);
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

}