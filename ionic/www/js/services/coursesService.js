angular
.module('starter')
.factory('coursesService', coursesService);

coursesService.$inject = ['$http', '$q', 'constantsService'];

function coursesService($http, $q, constantsService) {
    var service = {
        getCourses: getCourses,
        getUserWishListList: getUserWishListList,
        updateClassDetail: updateClassDetail,
        deleteClass: deleteClass,
        addToMyWisList: addToMyWisList,
        addNewClass: addNewClass

        
    };

    return service;

    function getCourses(){
    	var deferred = $q.defer();
        $http({
            method : 'GET',
            url :  constantsService.url+'/courses'
        }).then(function(data){
            deferred.resolve(data);
        }, function(error){
            console.log('error',error);
            deferred.reject(error);
        });
        return deferred.promise;
    }

    function getUserWishListList(userUrl){
    	var deferred = $q.defer();
        $http({
            method : 'GET',
            url :  constantsService.url+'/wishlist?Person_id='+userUrl
        }).then(function(data){
            deferred.resolve(data);
        }, function(error){
            console.log('error',error);
            deferred.reject(error);
        });
        return deferred.promise;
    }

    function updateClassDetail(dataToUpdate){
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

    function deleteClass(dataToDelete){
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

    function addToMyWisList(newWishList){
        console.log("new join activit service",newWishList);
        var deferred = $q.defer();
        $http({
            method : 'POST',
            url :  constantsService.url+'/wishlist?Person_url='+newWishList.Person_id,
            data: newWishList
        }).then(function(data){
            console.log('newactivity return',data);
            deferred.resolve(data);
        }, function(error){
            console.log('error',error);
            deferred.reject(error);
        });
        return deferred.promise;
    }

    function addNewClass(newclassDetail){
    	console.log('data from controller',newclassDetail);
        var deferred = $q.defer();
        $http({
            method : 'POST',
            url :  constantsService.url+'/courses',
            data : newclassDetail
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
