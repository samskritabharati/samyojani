angular
.module('starter')
.controller('editactivitysController', editactivitysController);

editactivitysController.$inject = ['$scope', '$stateParams', '$state','userInfoService','$ionicModal','userAuthenticationService', 'projectService', '$localStorage','$ionicHistory','$timeout' ,'activityService' ,'filterFilter','$rootScope','$filter'];

function editactivitysController($scope, $stateParams, $state, userInfoService, $ionicModal, userAuthenticationService, projectService, $localStorage,$ionicHistory,$timeout,activityService,filterFilter,$rootScope,$filter) {
	var vm = this;
	vm.showSpinner = false;
	vm.saveUpdatedActivityDetail = saveUpdatedActivityDetail;
	vm.Activity = $state.params.editdata;
	vm.closeModel = closeModel;
	vm.editActivity = vm.Activity;
	vm.seacrchForCoordinator = seacrchForCoordinator;
	vm.searchUser = searchUser;
	vm.choosedCoordinator =  choosedCoordinator;
	vm.closeThisModel = closeThisModel;	
	var st_date = $filter('date')(vm.Activity.Start_date, 'MM/dd/yyyy');
	vm.editActivity.Start_date = st_date;
	var ed_date = $filter('date')(vm.Activity.End_date, 'MMM dd yyyy');
	vm.editActivity.End_date = ed_date;
	userInfoService.getAllActivity().then(function(activity){
		vm.activityList= activity.data ;
	})
	getCoordinatorInfo();
	projectList();
	recurrenceList();

	function getCoordinatorInfo(){
		if(vm.editActivity.Coordinator_url){
			userInfoService.getActivityCoordinatorDetail(vm.editActivity.Coordinator_url).then(function(coordinatorDetails){
				vm.showSpinner = false;
				vm.coordinatorName = coordinatorDetails.data.Name
			},function(error){
				console.log('error',error);
			});
		}



	}
	function saveUpdatedActivityDetail(updatedActivity){
		vm.showSpinner = true;
		userInfoService.updateActivity(updatedActivity).then(function(data){
			vm.showSpinner = false;
			$ionicHistory.nextViewOptions({
				disableBack: true
			});
			$state.go('app.organizer');
		},function(error){
			console.log(error);
		});
	}

	function closeModel(){
		$ionicHistory.nextViewOptions({
			disableBack: true
		});
		$state.go('app.organizer');
	} 

	function recurrenceList(){
		vm.showSpinner = true;
		activityService.getRecurrence().then(function(recurrence){
			vm.recurrenceList = recurrence;
			vm.showSpinner = false;
		})
	}

	function projectList(){
		vm.showSpinner = true;
		projectService.getAllProject().then(function(project){
			vm.projectList = project.data;
			vm.showSpinner = false;
		})
	}

	function seacrchForCoordinator(){
		$ionicModal.fromTemplateUrl('chooseCoordinator.html', {
			scope: $scope,
		}).then(function(modal) {
			$scope.modal = modal;
			vm.showSpinner = false;
			$scope.modal.show();
		});
	}

	function searchUser(criteria){ 
		vm.showSpinner = true;
		if(!criteria){
			userInfoService.getUser().then(function(userDetail){
				vm.showSearchCount = true;
				vm.user = userDetail;
				$scope.currentPage = 1;
				$scope.totalItems = userDetail.data.length;
				$scope.entryLimit = 5; 
				$scope.noOfPages = Math.ceil($scope.totalItems / $scope.entryLimit);

				$scope.$watch('search', function (newVal, oldVal) {
					$scope.filtered = filterFilter(vm.user.data, newVal);
					$scope.totalItems = $scope.filtered.length;
					$scope.noOfPages = Math.ceil($scope.totalItems / $scope.entryLimit);
					$scope.currentPage = 1;
					vm.showSpinner = false;
				}, true);

			},function(error){
				console.log("Error in updating FacebookID")
			})

		}else{

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
			if(!criteria.role){
				criteria.role =''
			}
			if(!criteria.city){
				criteria.city =''
			}
			if(!criteria.country){
				criteria.country =''
			}
			if(!criteria.city){
				criteria.city =''
			}
			userInfoService.searchForUser(criteria).then(function(userDetail){
				vm.showSearchCount = true;
				vm.user = userDetail;
				$scope.currentPage = 1;
				$scope.totalItems = userDetail.data.length;
				$scope.entryLimit = 10; 
				$scope.noOfPages = Math.ceil($scope.totalItems / $scope.entryLimit);

				$scope.$watch('search', function (newVal, oldVal) {

					$scope.filtered = filterFilter(vm.user.data, newVal);
					$scope.totalItems = $scope.filtered.length;
					$scope.noOfPages = Math.ceil($scope.totalItems / $scope.entryLimit);
					$scope.currentPage = 1;
					vm.showSpinner = false;
				}, true);

			},function(error){
				console.log("Error in updating FacebookID")
			})
		}
	}

	function choosedCoordinator(choosedData){
		$scope.modal.hide();
		vm.editActivity.Coordinator_url = choosedData._url;
		vm.coordinatorName = choosedData.Name;      
	}

	function closeThisModel(){
		$scope.modal.hide();
	}

}