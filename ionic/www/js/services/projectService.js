angular
.module('starter')
.factory('projectService', projectService);

projectService.$inject = ['$http', '$q', 'constantsService'];

function projectService($http, $q, constantsService) {
    var service = {
        
        getAllProject: getAllProject,
        deleteProject: deleteProject,
        projectType: projectType,
        addProject: addProject,
        updateProject: updateProject

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

      function deleteProject(projectToDelete){
        var deferred = $q.defer();
        $http({
            method : 'DELETE',
            url :  constantsService.url+projectToDelete
        }).then(function(data){
            deferred.resolve(data);
        }, function(error){
            console.log('error',error);
            deferred.reject(error);
        });
        return deferred.promise;
    }

    function projectType(){
        var deferred = $q.defer();
        $http({
            method : 'GET',
            url :  constantsService.url+'/presets/Project_type'
        }).then(function(data){
            deferred.resolve(data);
        }, function(error){
            console.log('error',error);
            deferred.reject(error);
        });
        return deferred.promise;
    }

    function addProject(newProjectDetail){
        console.log('data from controller',newProjectDetail);
        var deferred = $q.defer();
        $http({
            method : 'POST',
            url :  constantsService.url+'/projects',
            data : newProjectDetail
        }).then(function(data){
            deferred.resolve(data);
        }, function(error){
            console.log('error',error);
            deferred.reject(error);
        });
        return deferred.promise;
    }

    function updateProject(projectDetail){
        console.log('updateurl',projectDetail);
        var deferred = $q.defer();
        $http({
            method : 'PUT',
            url :  constantsService.url+projectDetail._url,
            data: projectDetail
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