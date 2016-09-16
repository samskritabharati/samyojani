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
        addNewClass: addNewClass,
        getUserWishList: getUserWishList,
        getClassByUrl: getClassByUrl,
        deletClassFromUserWishList: deletClassFromUserWishList
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
        console.log("servc",userUrl);
        var deferred = $q.defer();
        $http({
            method : 'GET',
            url :  constantsService.url+'/wishlist?Person_url='+userUrl
        }).then(function(data){
            deferred.resolve(data);
        }, function(error){
            console.log('error',error);
            deferred.reject(error);
        });
        return deferred.promise;
    }

    function updateClassDetail(dataToUpdate){
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

    function deleteClass(dataToDelete){
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

    function addToMyWisList(newWishList){
        var deferred = $q.defer();
        $http({
            method : 'POST',
            url :  constantsService.url+'/wishlist?Person_url='+newWishList.Person_id,
            data: newWishList
        }).then(function(data){
            deferred.resolve(data);
        }, function(error){
            console.log('error',error);
            deferred.reject(error);
        });
        return deferred.promise;
    }

    function addNewClass(newclassDetail){
        var deferred = $q.defer();
        $http({
            method : 'POST',
            url :  constantsService.url+'/courses',
            data : newclassDetail
        }).then(function(data){
            deferred.resolve(data);
        }, function(error){
            console.log('error',error);
            deferred.reject(error);
        });
        return deferred.promise;
    }

    function getUserWishList(userUrl){
        var deferred = $q.defer();
        $http({
            method : 'GET',
            url : constantsService.url+'/wishlist?Person_url='+userUrl
        }).then(function(data){
            deferred.resolve(data);
        }, function(error){
            console.log('error',error);
            deferred.reject(error);
        });
        return deferred.promise;
    }

    function getClassByUrl(classUrl){
        var deferred = $q.defer();
        $http({
            method : 'GET',
            url :  constantsService.url+classUrl
        }).then(function(data){
            deferred.resolve(data);
        }, function(error){
            console.log('error',error);
            deferred.reject(error);
        });
        return deferred.promise;
    }

    function deletClassFromUserWishList(roleurl){
        var deferred = $q.defer();
        $http({
            method : 'DELETE',
            url :  constantsService.url+roleurl
        }).then(function(data){
            deferred.resolve(data);
        }, function(error){
            deferred.reject(error);
        });
        return deferred.promise;
    }

}
