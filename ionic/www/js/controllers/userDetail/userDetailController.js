angular
.module('starter')
.controller('userDetailController', userDetailController);

userDetailController.$inject = ['$scope', '$stateParams', '$state', 'userInfoService', '$ionicHistory', '$localStorage'];

function userDetailController($scope, $stateParams, $state, userInfoService, $ionicHistory,$localStorage) {
	var vm = this;

	vm.searchUser = searchUser;
	vm.role = $localStorage.userInfo.data[0].Role;

	function searchUser(criteria){
		console.log('vm.search',criteria);
		if(!criteria.name){
			criteria.name =''
		}
		if(!criteria.email){
			criteria.email =''
		}
		if(!criteria.phone){
			criteria.phone =''
		}
		if(!criteria.address){
			criteria.address =''
		}
console.log("fina",criteria);



		userInfoService.searchForUser(criteria).then(function(userDetail){
            console.log("criteria",userDetail);
            vm.user = userDetail;
        },function(error){
            console.log("Error in updating FacebookID")
        })
	}
}