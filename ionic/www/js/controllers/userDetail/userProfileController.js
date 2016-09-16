angular
.module('starter')
.controller('userProfileController', userProfileController);

userProfileController.$inject = ['$scope', '$state', 'userInfoService', '$ionicHistory', '$localStorage','$ionicModal' ,'userAuthenticationService','$rootScope'];

function userProfileController($scope, $state, userInfoService, $ionicHistory,$localStorage,$ionicModal,userAuthenticationService, $rootScope) {

	var vm = this;
	vm.showSpinner = true;
	vm.showEdit = showEdit;
	vm.decline = decline;
	vm.updateUserProfile = updateUserProfile
	vm.userProfileInfo  = [];
	vm.userProfileInfo = angular.copy($localStorage.userInfo.data[0]);
	vm.showSpinner = false;
	vm.fieldEditable = true;
	vm.edititemtrue = true;
	vm.edititem = false;
	vm.showEditButton = true;
	vm.showUpdateButn = false;
	vm.nonEditableField = true;
	$rootScope.currentMenu = 'userProfile';
	
	if($localStorage.userInfo.data[0].Name != '' || $localStorage.userInfo.data[0].Name != null){
		$localStorage.userlogin = true;

	}

	function showEdit(){
		vm.showSpinner = true;
		userProfession();
		vm.fieldEditable = false;
		vm.edititemtrue = true;
		vm.edititem = true;
		vm.showEditButton = false;
		vm.showUpdateButn = true
		vm.showSpinner = false;
	}

	function decline(){
		vm.userProfileInfo  = "";
		vm.userProfileInfo = angular.copy($localStorage.userInfo.data[0]);
		vm.fieldEditable = true;
		vm.edititemtrue = false;
		vm.edititem = true;
		vm.showEditButton = true;
		vm.showUpdateButn = false;
	}

	function updateUserProfile(updatedProfile){  
		vm.showSpinner = true;   
		userInfoService.updateUserDetail(updatedProfile).then(function(updatedProfileInfo){
			$localStorage.userInfo.data[0] = updatedProfileInfo.data;
			vm.userProfileInfo = angular.copy($localStorage.userInfo.data[0]);
			vm.fieldEditable = true;
			vm.edititemtrue = false;
			vm.edititem = true;
			vm.showEditButton = true;
			vm.showUpdateButn = false;
			vm.showSpinner = false;
		},function(error){
			console.log(error);
		});
	}

	function userProfession(){
		vm.showSpinner = true;
		userAuthenticationService.getProfession().then(function(userProfession){
			vm.userProfessionList = userProfession;
			vm.showSpinner = false;
		},function(error){
			console.log(error);
		})
	} 

}