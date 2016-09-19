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
	
	var st_date = $filter('date')(vm.Activity.Start_date, 'MM/dd/yyyy');
	vm.editActivity.Start_date = st_date;
	var ed_date = $filter('date')(vm.Activity.End_date, 'MMM dd yyyy');
	vm.editActivity.End_date = ed_date;
	userInfoService.getAllActivity().then(function(activity){
		vm.activityList= activity.data ;
	})
	projectList();
	recurrenceList();

	function saveUpdatedActivityDetail(updatedActivity){
		vm.showSpinner = true;
		updatedActivity.Coordinator_url = $localStorage.userInfo.data[0]._url;    
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

}