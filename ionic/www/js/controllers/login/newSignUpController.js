angular
.module('starter')
.controller('newSignUpController', newSignUpController);

newSignUpController.$inject = ['$scope', '$stateParams', '$state', 'userAuthenticationService', '$ionicModal', 'userInfoService', 'userAuthenticationService', '$localStorage','$rootScope','$ionicHistory'];

function newSignUpController($scope, $stateParams, $state, userAuthenticationService, $ionicModal, userInfoService, userAuthenticationService, $localStorage,$rootScope,$ionicHistory) {
	var vm = this;

	vm.addUser = addUser;
	vm.closeModel =  closeModel;
	vm.updateUser = updateUser;

	vm.showUpdateButtn = false;
	vm.showText = false
	vm.userAddress = [];
	vm.newUser = [];
	vm.newUser.Interests = [];

	userProfession();
	getCountry();
	UserInterestsList();
	if($rootScope.fbResponse && (!$rootScope.email)){
		$rootScope.fbResponse
		vm.newUser = {
			Name: $rootScope.fbResponse.name
		}
	}
	if(($rootScope.fbResponse.length>0) && $rootScope.email){
		vm.newUser = {
			Name: $rootScope.fbResponse.name,
			Email: $rootScope.email
		}
	}

	if(($rootScope.email) && (!$rootScope.fbResponse)){

		vm.newUser = {
			Email: $rootScope.email
		}
	}
	if($rootScope.googleInfo){
		vm.newUser = {
			Name: $rootScope.googleInfo.name,
			Email:  $rootScope.googleInfo.email
		}
	}
	if($localStorage.update.length>0){
		vm.showUpdateButtn = true;

		userAuthenticationService.emailauthentication($localStorage.update).then(function(userData){
			if(userData.data.length>0){
				vm.newUser = userData.data[0];
				vm.newUser.Profession = vm.newUser.Profession
			}else{
				userAuthenticationService.phoneauthentication($rootScope.userPhone).then(function(userData){
					if(userData.data.length > 0){
						vm.newUser = userData.data[0];
						vm.newUser.Email = $localStorage.update;
						vm.newUser.Profession = vm.newUser.Profession
					}else{
						vm.newUser = {
							Phone: $rootScope.userPhone,
							Email: $localStorage.update
						}
					}
				})

			}			
		},function(error){
			console.log(error)
		})
	}else{
		vm.newUser = {
			Phone: $rootScope.userPhone,
			Email: $rootScope.email
		}
	}


	function closeModel(){
		$ionicHistory.nextViewOptions({
			disableBack: true
		});
$state.go('app.main');
		/*if($localStorage.userInfo == ""){
			$state.go('app.main');
		}else {
			if($localStorage.userInfo.data[0].Role == 'Student'){
				$state.go('app.student');
			}
			if($localStorage.userInfo.data[0].Role != 'Student'){
				$state.go('app.organizer');
			}
			if($localStorage.userInfo.data[0].Role == null){
				$state.go('app.student');
			}
		}*/

	} 

	function userProfession(){
		userAuthenticationService.getProfession().then(function(userProfession){
			vm.userProfessionList = userProfession;
		},function(error){
			console.log(error);
		})
	} 

	function UserInterestsList(){
		userInfoService.getUserInterestsList().then(function(userInterests){
			vm.userInterestsList = userInterests;
		},function(error){
			console.log(error);
		})
	}

	function addUser(newUserDetail){
		if($rootScope.fbResponse){
			newUserDetail.Facebook_id = $rootScope.fbResponse.id;
		}
		newUserDetail.Role = "Student";
		userInfoService.addNewUser(newUserDetail).then(function(responsedata){
			userAuthenticationService.emailauthentication(responsedata.data.Email).then(function(userData){
				$localStorage.userInfo = [];
				$rootScope.fbResponse = [];
				$rootScope.email = [];
				$rootScope.googleInfo = [];
				$localStorage.update = [];
				$localStorage.update = [];
				$localStorage.userInfo = userData;

				$ionicHistory.nextViewOptions({
					disableBack: true
				});
				$state.go('app.student');
			},function(error){
				console.log(error);
			});

		},function(error){
			console.log('error');
		})
	} 

	function updateUser(newUserDetail){
		if($rootScope.fbResponse){
			newUserDetail.Facebook_id = $rootScope.fbResponse.id;
		}
		userInfoService.updateUserDetail(newUserDetail).then(function(userUpdateddata){
			userAuthenticationService.emailauthentication(userUpdateddata.data.Email).then(function(userData){
				$localStorage.userInfo = [];
				$rootScope.fbResponse = [];
				$rootScope.email = [];
				$rootScope.googleInfo = [];
				$localStorage.update = [];
				$localStorage.userInfo = userData;

				$ionicHistory.nextViewOptions({
					disableBack: true
				});
				if(userData.data[0].Role == 'Student'){
					$state.go('app.student');
				}else{
					if(userData.data[0].Role == null){
						$state.go('app.student');
					}else{
						$state.go('app.organizer');
					}

				}
			},function(error){
				console.log(error);
			});

		},function(error){
			console.log(error);
		});
	}

	function getCountry(){
		userInfoService.getAllCountryList().then(function(countrty){
			vm.countrList = countrty;
		},function(error){
			console.log(error);
		})
	} 

	$scope.$watch(function() { return   vm.newUser.Interests},
		function(data) {
			if(data == 'Other'){
				vm.showText = true

			}
		})

}
