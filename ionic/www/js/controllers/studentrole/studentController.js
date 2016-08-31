angular
.module('starter')
.controller('studentController', studentController);

studentController.$inject = ['$scope', '$stateParams', '$state', '$location', '$localStorage', 'userInfoService' ,'activityService','$ionicHistory'];

function studentController($scope, $stateParams, $state, $location, $localStorage, userInfoService, activityService, $ionicHistory) {
     var vm = this;
     
     vm.detailAboutActivity = detailAboutActivity;
     vm.joinActivity = joinActivity;

    vm.activityNewList = [];
    vm.userName = $localStorage.userInfo.data[0].Name
    if($localStorage.userInfo.data[0].Name != '' || $localStorage.userInfo.data[0].Name != null){
         $localStorage.userlogin = true;

    }
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
        userInfoService.getUserActivities($localStorage.userInfo.data.SB_Region).then(function(activityData){
            vm.activityData = activityData.data;
            userInfoService.getUserClassList($localStorage.userInfo.data[0]._url).then( function (studentClass){
            angular.forEach(activityData.data, function (key, index) {

               angular.forEach(studentClass.data, function (classEnrolled, index) {
                if(key._url == classEnrolled.Activity_url){
                  activityWithEnrollStructure(key,classEnrolled);
                }else{
                  activityWithOutEnrollStructure(key);
                }
               })
           /*   var result = $.grep(activityData.data, function (packState) {
             
              
                return  packState._url == key.Activity_url;
              });

              console.log("result",result);
              console.log(!(result && result.length > 0));
              if(result && result.length > 0){
                  activityWithEnrollStructure(result[0],key);
              }
              else{
                  console.log("else")
                  activityWithOutEnrollStructure(result[0]);
              }*/
            })
              




        },function(error){
            console.log('error in getting student class',error);
        })
        },function(error){
            console.log(error);
        });
    }

    function detailAboutActivity(activity){ 
      $ionicHistory.nextViewOptions({
            disableBack: true
          });
        $state.go('app.activityDetail',{'activityDetail':activity},{location: false, inherit: false});
    }

    function joinActivity(activityTOjoin,state){
        
        if(state == "Confirmed"){
            var newJoindActivity = {
                Activity_url: activityTOjoin._url, 
                Person_url: $localStorage.userInfo.data[0]._url, 
                Role:  $localStorage.userInfo.data[0].Role,
                Status:'Confirmed',
                Last_active_date:new Date()
            }
        }else{
            var newJoindActivity = {
                Activity_url: activityTOjoin._url, 
                Person_url: $localStorage.userInfo.data[0]._url, 
                Role:  $localStorage.userInfo.data[0].Role,
                Status:'Tentative',
                Last_active_date:new Date()
            }
        }
        
        activityService.joinActivity(newJoindActivity).then(function(data){
        },function(error){
            console.log(error);
        })
    }

    function activityWithEnrollStructure(activity,myactivity){
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
                myactivity_url: myactivity._url,
                myactivity_Person_url:myactivity.Person_url,
                myactivity_Role:myactivity.Role,
                myactivity_Status:myactivity.Status,


           }
           vm.activityNewList.push(_activityDetail);
    }

    function activityWithOutEnrollStructure(activity){
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
                myactivity_url: "",
                myactivity_Person_url:"",
                myactivity_Role:"",
                myactivity_Status:""


           }
           vm.activityNewList.push(_activityDetail);
           
    }

    
 

}