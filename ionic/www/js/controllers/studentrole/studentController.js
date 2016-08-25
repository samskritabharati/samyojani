angular
.module('starter')
.controller('studentController', studentController);

studentController.$inject = ['$scope', '$stateParams', '$state', '$location', '$rootScope', 'userInfoService' ,'activityService'];

function studentController($scope, $stateParams, $state, $location, $rootScope, userInfoService, activityService) {
     var vm = this;
     
     vm.detailAboutActivity = detailAboutActivity;
     vm.joinActivity = joinActivity;

    vm.userName = $stateParams.userdata;
     $rootScope.userlogin = true;
     showActivity();

     $scope.tabs = [{
          title: 'Upcoming Classes',
          url: 'joinshibira.html'
     }, {
          title: 'Offered Courses',
          url: 'myshibira.html'

     }];

     $scope.currentTab = 'joinshibira.html';

     $scope.onClickTab = function (tab) {
          $scope.currentTab = tab.url;
     }

     $scope.isActiveTab = function(tabUrl) {
          return tabUrl == $scope.currentTab;
     }

     function showActivity(){
        console.log($rootScope.userDetail.data);
        console.log('student sb reg',$rootScope.userDetail.data.SB_Region);
        userInfoService.getUserActivities($rootScope.userDetail.data.SB_Region).then(function(activityData){
            vm.activityData = activityData.data;
            console.log('activityData',vm.activityData);
        },function(error){
            console.log(error);
        });
    }

    function detailAboutActivity(activity){ 
        $state.go('app.activityDetail',{'activityDetail':activity},{location: false, inherit: false});
    }

    function joinActivity(activityTOjoin,state){
        console.log(activityTOjoin);
        
        var date = new Date();
        console.log(date);
        if(state == "Confirmed"){
            var newJoindActivity = {
                Activity_url: activityTOjoin._url, 
                Person_url: $rootScope.userDetail.data[0]._url, 
                Role: $rootScope.userDetail.data[0].Role,
                Status:'Confirmed',
                Last_active_date:new Date()
            }
        }else{
            var newJoindActivity = {
                Activity_url: activityTOjoin._url, 
                Person_url: $rootScope.userDetail.data[0]._url, 
                Role: $rootScope.userDetail.data[0].Role,
                Status:'Tentative',
                Last_active_date:new Date()
            }
        }
        
        console.log('newJoindActivity',newJoindActivity);
        activityService.joinActivity(newJoindActivity).then(function(data){
            console.log('activity joined scc',data);
        },function(error){
            console.log(error);
        })
    }

    function activityStructure(){
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
/*                myStateInActivity :
*/            }
    }

    
 

}