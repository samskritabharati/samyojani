angular
    .module('starter')
    .controller('organizerController', organizerController);

  organizerController.$inject = ['$scope', '$stateParams', '$state', '$rootScope','userInfoService','$ionicModal','userAuthenticationService'];

  function organizerController($scope, $stateParams, $state, $rootScope,userInfoService, $ionicModal, userAuthenticationService) {
    var vm = this;
    vm.detailAboutActivity = detailAboutActivity;
    vm.updateActivity = updateActivity;
    vm.saveUpdatedActivityDetail = saveUpdatedActivityDetail;
    vm.deleteActivity = deleteActivity;
    vm.updateUser = updateUser;
    vm.userName = $rootScope.userDetail.data[0].Name;
    vm.saveUpdatedUserDetail = saveUpdatedUserDetail;
    vm.closeModel = closeModel;
    vm.deleteUser = deleteUser;
    vm.activityDetail = [];
    showActivity();
    showUser();
    $scope.sortReverse  = false;
    $scope.sortReverse = false;
    $scope.tabs = [{
            title: 'Upcoming Classes',
            url: 'addClass.html'
        }, {
            title: 'People',
            url: 'people.html'
        }];

    $scope.currentTab = 'addClass.html';

    $scope.onClickTab = function (tab) {
        $scope.currentTab = tab.url;
    }
    
    $scope.isActiveTab = function(tabUrl) {
        return tabUrl == $scope.currentTab;
    }

    function detailAboutActivity(activity){ 
        $state.go('app.activityDetail',{'activityDetail':activity},{location: false, inherit: false});
    }

    
    function updateActivity(activity){
        userInfoService.getAllActivity().then(function(activity){
            vm.activityList= activity.data ;
        })
        userInfoService.getAllProject().then(function(project){
            vm.projectList = project.data;
        })
        
        vm.editActivity = activity;

        console.log('showUp',vm.editActivity);
        $ionicModal.fromTemplateUrl('editActivity.html', {
            scope: $scope,
            animation: 'slide-in-up'
        }).then(function(modal) {
            $scope.modal = modal;
            $scope.modal.show();
        });
 
    }

    function saveUpdatedActivityDetail(updatedActivity){
        updatedActivity.Coordinator_url = $rootScope.userDetail.data[0]._url;
        console.log( updatedActivity.Coordinator_url);
        console.log('updatedActivity',updateActivity);
         userInfoService.updateActivity(updatedActivity).then(function(data){
            console.log('updatedataresult',data)
            $scope.modal.hide();
         },function(error){
            console.log(error);
         });
    }

    function deleteActivity(activityToDelete){
        userAuthenticationService.confirm('','Do You Want To Delet Activity?','Yes','No',function(){
            userInfoService.deleteActivity(activityToDelete).then(function(data){
                console.log('deleted Succ',data);
                showActivity();
            },function(error){
                console.log(error);
            });
        },null)
        
    }

    function showActivity(){
        console.log('$rootScope.userDetail.data[0].SB_Region',$rootScope.userDetail.data[0].SB_Region);
        userInfoService.getUserActivities($rootScope.userDetail.data[0].SB_Region).then(function(activityData){
            vm.activityData = activityData.data;
        },function(error){
            console.log(error);
        });
    }

    function closeModel(){
          $scope.modal.hide();
    }  

    function showUser(){
        userInfoService.getUser().then(function(userlist){
            vm.userlist = userlist;
            console.log(' vm.userlist', vm.userlist);
        },function(error){
            console.log('Error in getting all userList',error);
        })
    }

    function deleteUser(user){
        userAuthenticationService.confirm('','Do You Want To Delet This User?','Yes','No',function(){
            userInfoService.deleteActivity(user).then(function(data){
                console.log('deleted Succ',data);
                showUser();
            },function(error){
                console.log(error);
            });
        },null)
        
    }

    function updateUser(userDetail){
        vm.showUserDetail = userDetail;
        userAuthenticationService.getProfession().then(function(userProfession){
            vm.userProfessionList = userProfession;
        },function(error){
             console.log(error);
        })

        userInfoService.getUserRole().then(function(userRole){
            vm.userRole = userRole.data;
        },function(error){
             console.log(error);
        })
        console.log('showUp',vm.showUserDetail);
        $ionicModal.fromTemplateUrl('editUser.html', {
            scope: $scope,
            animation: 'slide-in-up'
        }).then(function(modal) {
            $scope.modal = modal;
            $scope.modal.show();
        });
    }

    function saveUpdatedUserDetail(updatedUserDetail){
        console.log('updatedActivity',updatedUserDetail);
         userInfoService.updateUserDetail(updatedUserDetail).then(function(data){
            console.log('updatedataresult',data)
            $scope.modal.hide();
         },function(error){
            console.log(error);
         });
    }
  }

