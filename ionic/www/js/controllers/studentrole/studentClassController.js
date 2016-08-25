angular
	.module('starter')
	.controller('studentClassController', studentClassController);

studentClassController.$inject = ['$scope', '$stateParams', '$state', '$location', '$rootScope', 'userInfoService'];

function studentClassController($scope, $stateParams, $state, $location, $rootScope, userInfoService) {
    var vm = this;

    showStudentClass();

    function showStudentClass(){
    	console.log("from controller",$rootScope.userDetail.data[0]._url);
    	userInfoService.getUserClassList($rootScope.userDetail.data[0]._url).then( function (studentClass){
    		console.log("studentClass",studentClass);
    	},function(error){
    		console.log('error in getting student class',error);
    	})
    }

}