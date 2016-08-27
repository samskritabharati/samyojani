angular
    .module('starter')
    .controller('organizerController', organizerController);

  organizerController.$inject = ['$scope', '$stateParams', '$state','userInfoService','$ionicModal','userAuthenticationService', 'projectService', '$localStorage','$ionicHistory'];

  function organizerController($scope, $stateParams, $state, userInfoService, $ionicModal, userAuthenticationService, projectService, $localStorage,$ionicHistory) {
    var vm = this;

    vm.addNewUser = addNewUser;
    vm.detailAboutActivity = detailAboutActivity;
    vm.updateActivity = updateActivity;
    vm.saveUpdatedActivityDetail = saveUpdatedActivityDetail;
    vm.deleteActivity = deleteActivity;
    vm.updateUser = updateUser;
    vm.userName = $localStorage.userInfo.data[0].Name;
    vm.saveUpdatedUserDetail = saveUpdatedUserDetail;
    vm.showNewActivityForm = showNewActivityForm;
    vm.showFormForNewUser = showFormForNewUser;
    vm.closeModel = closeModel;
    vm.deleteUser = deleteUser;
    vm.activityDetail = [];
    vm.userList = [];

    if($localStorage.userInfo.data[0].Name != '' || $localStorage.userInfo.data[0].Name != null){
         $localStorage.userlogin = true;

    }
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
         $ionicHistory.nextViewOptions({
            disableBack: true
          });
        $state.go('app.activityDetail',{'activityDetail':activity},{location: false, inherit: false});
    }

    
    function updateActivity(activity){
        userInfoService.getAllActivity().then(function(activity){
            vm.activityList= activity.data ;
        })
        projectService.getAllProject().then(function(project){
            vm.projectList = project.data;
            console.log('vm.projectList',vm.projectList);
        })
        
        vm.editActivity = activity;

        console.log('showUp',vm.editActivity);

        console.log("editng ths",vm.editActivity);
        $ionicModal.fromTemplateUrl('editActivity.html', {
            scope: $scope,
            animation: 'slide-in-up'
        }).then(function(modal) {
            $scope.modal = modal;
            $scope.modal.show();
        });
 
    }

    function saveUpdatedActivityDetail(updatedActivity){
        console.log("updated",updatedActivity);
        updatedActivity.Coordinator_url = $localStorage.userInfo.data[0]._url;    
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
        userInfoService.getUserActivities($localStorage.userInfo.data[0].SB_Region).then(function(activityData){
            vm.activityData = activityData.data;
            console.log("activitycount", vm.activityData);
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

        userRole();
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

    function showNewActivityForm(){
         $state.go('app.addActivity',{},{location: false, inherit: false});
    }

    function addNewUser(userDetail){
console.log('sss',userDetail);
        vm.userList.push(userDetail);
        console.log('vm.userList');
        var newUserDetail = [];
        newUserDetail = userDetail;
        console.log('newUserDetail',newUserDetail);
         userInfoService.addNewUser(newUserDetail).then(function(data){
               console.log('returndata',data);
          },function(error){
               console.log('error');
          })
    }

    function showFormForNewUser(){
        userRole();
        $ionicModal.fromTemplateUrl('newUsersForm.html', {
            scope: $scope,
            animation: 'slide-in-up'
        }).then(function(modal) {
            $scope.modal = modal;
            $scope.modal.show();
        });
 
    }
    function userRole(){
        userInfoService.getUserRole().then(function(userRole){
            vm.userRole = userRole.data;
        },function(error){
             console.log(error);
        })
    }
  }

