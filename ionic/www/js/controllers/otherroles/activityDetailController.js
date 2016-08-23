angular
    .module('starter')
    .controller('activityDetailController', activityDetailController);

  	activityDetailController.$inject = ['$scope', '$stateParams', '$state', '$rootScope','userInfoService','$ionicModal','userAuthenticationService'];

  	function activityDetailController($scope, $stateParams, $state, $rootScope,userInfoService, $ionicModal, userAuthenticationService) {
    	var vm = this;
    	var activity = $state.params.activityDetail;

    	vm.userName = $rootScope.userDetail.data[0].Name;
    	
    	showDetailActivity(activity);

    	function showDetailActivity(activity){
    		userInfoService.getActivityProjectDetail(activity.Project_url).then(function(projectDetails){
                console.log('projectDetails',projectDetails);
                if(activity.Coordinator_url != null || activity.Coordinator_url == ""){
                    userInfoService.getActivityCoordinatorDetail(activity.Coordinator_url).then(function(coordinatorDetails){
                        console.log(coordinatorDetails);
                        ActivityDetailStructure(activity,coordinatorDetails,projectDetails);
                    },function(error){
                        console.log('error',error);
                    });
                }else{
                     ActivityDetailStructure(activity,'',projectDetails);
                }
               
            },function(error){
                console.log('error',error);
            })

    	}
    	 
    	function ActivityDetailStructure(activity,coordinatorDetails){
	        var _activityDetail = {
	            activity_type_id: activity.Activity_type_id,
	            activity_address: activity.Address,
	            activity_coordinator_url: activity.Coordinator_url,
	            activity_email: activity.Email,
	            activity_end_date: activity.End_date,
	            activity_end_time: activity.End_time,
	            activity_name: activity.Name,
	            activity_phone: activity.Phone,
	            activity_project_url: activity.Project_url,
	            activity_recurrence: activity.Recurrence,
	            activity_sb_Region: activity.SB_Region,
	            activity_start_date: activity.Start_date,
	            activity_start_time: activity.Start_time,
	            activity_URL: activity.URL,
	            activity__url: activity._url,
	            coordinator_Address: coordinatorDetails.data.Address,
	            coordinator_Email: coordinatorDetails.data.Email,
	            coordinator_Name: coordinatorDetails.data.Name,
	            coordinator_Phone: coordinatorDetails.data.Phone,
	            coordinator_Profession: coordinatorDetails.data.Profession,
	            coordinator_Role: coordinatorDetails.data.Role,
	            coordinator_SB_Region: coordinatorDetails.data.SB_Region,
	            coordinator_URL: coordinatorDetails.data.URL,
	            coordinator__url: coordinatorDetails.data._url
	        }
	         vm.activityDetail = _activityDetail;
	         console.log('detail activity',vm.activityDetail);
   		 }

	}