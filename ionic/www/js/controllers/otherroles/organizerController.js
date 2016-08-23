angular
    .module('starter')
    .controller('organizerController', organizerController);

  organizerController.$inject = ['$scope', '$stateParams', '$state', '$rootScope','userInfoService','$ionicModal'];

  function organizerController($scope, $stateParams, $state, $rootScope,userInfoService, $ionicModal) {
    var vm = this;
    vm.detailAboutActivity = detailAboutActivity;
    vm.updateActivity = updateActivity;
    vm.saveUpdatedActivityDetail = saveUpdatedActivityDetail;
    vm.deleteActivity = deleteActivity;
    vm.userName = $rootScope.userDetail.data[0].Name;
    showActivity();
  
    $scope.sortReverse  = false;
    $scope.sortReverse = false;
    $scope.tabs = [{
            title: 'Upcoming Classes',
            url: 'addClass.html'
        }, {
            title: 'People',
            url: 'showClass.html'
        }];

    $scope.currentTab = 'addClass.html';

    $scope.onClickTab = function (tab) {
        $scope.currentTab = tab.url;
    }
    
    $scope.isActiveTab = function(tabUrl) {
        return tabUrl == $scope.currentTab;
    }

    function detailAboutActivity(activity){
        console.log('activity',activity);
       /* if(activity.Phone == "" ||activity.Phone == null ){*/
            userInfoService.getActivityProjectDetail(activity.Project_url).then(function(projectDetails){
                console.log('projectDetails',projectDetails);
                userInfoService.getActivityCoordinatorDetail(activity.Coordinator_url).then(function(coordinatorDetails){
                console.log(coordinatorDetails);
                ActivityDetailStructure(activity,coordinatorDetails,projectDetails);
            },function(error){
                console.log('error',error);
            });
            },function(error){
                console.log('error',error);
            })
           
        /*}*/
        $ionicModal.fromTemplateUrl('activityDetail.html', {
            scope: $scope,
            animation: 'slide-in-up'
        }).then(function(modal) {
            $scope.modal = modal;
            $scope.modal.show();
        });
         
        $scope.closeModal = function() {
            $scope.modal.hide();
        };
 

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
       
    }

    function updateActivity(activity){
        console.log('activity',activity);
        vm.editActivity = activity;
        $ionicModal.fromTemplateUrl('editActivity.html', {
            scope: $scope,
            animation: 'slide-in-up'
        }).then(function(modal) {
            $scope.modal = modal;
            $scope.modal.show();
        });
         
        $scope.closeModal = function() {
            $scope.modal.hide();
        };
 
    }

    function saveUpdatedActivityDetail(updatedActivity){
        console.log('updatedActivity',updatedActivity);
         userInfoService.updateActivity(updatedActivity).then(function(data){
            $scope.modal.hide();
         },function(error){
            console.log(error);
         });
    }

    function deleteActivity(activityToDelete){
        userInfoService.deleteActivity(activityToDelete).then(function(data){
            console.log('deleted Succ',data);
            showActivity();
        },function(error){
            console.log(error);
        });
    }

    function showActivity(){
        console.log('$rootScope.userDetail.data[0].SB_Region',$rootScope.userDetail.data[0].SB_Region);
        userInfoService.getUserActivities($rootScope.userDetail.data[0].SB_Region).then(function(activityData){
            vm.activityData = activityData.data;
            console.log('region data', vm.activityData);
        },function(error){
            console.log(error);
        });
    }

  }

