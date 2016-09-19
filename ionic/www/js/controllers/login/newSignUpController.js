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
	if($rootScope.fbResponse && (!$rootScope.email)){console.log("1")
		$rootScope.fbResponse
		vm.newUser = {
			Name: $rootScope.fbResponse.name
		}
	}
	console.log("$rootScope.fbResponse",$rootScope.fbResponse.length);
	if(($rootScope.fbResponse.length>0) && $rootScope.email){console.log("2")
		vm.newUser = {
			Name: $rootScope.fbResponse.name,
			Email: $rootScope.email
		}
	}

	if(($rootScope.email) && (!$rootScope.fbResponse)){console.log("3")

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
console.log("$localStorage.update",$localStorage.update);
	if($localStorage.update.length>0){
		vm.showUpdateButtn = true;
		
		userAuthenticationService.emailauthentication($localStorage.update).then(function(userData){
			console.log("test",userData.data);
			if(userData.data.length>0){
				console.log("no data");
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
			
			console.log("ggggggggggggggggg",vm.newUser);
		},function(error){
			console.log(error)
		})
	}else{
		console.log("4")
		vm.newUser = {
							Phone: $rootScope.userPhone,
							Email: $rootScope.email
						}
	}


	function closeModel(){
		$ionicHistory.nextViewOptions({
			disableBack: true
		});

		if($localStorage.userInfo == ""){
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
		}

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
		console.log("newUserDetail",newUserDetail);
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

/*$scope.$watch('vm.userInterestsList', function(nowSelected){
	$scope.selectedValues = [];*/

	$scope.$watch(function() { return   vm.newUser.Interests},
		function(data) {
			if(data == 'Other'){
				vm.showText = true

			}
		})

}
