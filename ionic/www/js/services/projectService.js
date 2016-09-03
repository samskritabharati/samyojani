angular
.module('starter')
.factory('projectService', projectService);

projectService.$inject = ['$http', '$q', 'constantsService'];

function projectService($http, $q, constantsService) {
    var service = {
        
        getAllProject: getAllProject,

    };

    return service;

    function getAllProject(){
        var deferred = $q.defer();
        $http({
            method : 'GET',
            url :  constantsService.url+'/projects'
        }).then(function(data){
            deferred.resolve(data);
        }, function(error){
            console.log('error',error);
            deferred.reject(error);
        });
        return deferred.promise;
    }
}