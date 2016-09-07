angular
    .module('starter')
    .controller('organizerController', organizerController);

  organizerController.$inject = ['$scope', '$stateParams', '$state','userInfoService','$ionicModal','userAuthenticationService', 'projectService', '$localStorage','$ionicHistory','$timeout' ,'activityService'];

  function organizerController($scope, $stateParams, $state, userInfoService, $ionicModal, userAuthenticationService, projectService, $localStorage,$ionicHistory,$timeout,activityService) {
    var vm = this;

    /*vm.addNewUser = addNewUser;*/
    vm.detailAboutActivity = detailAboutActivity;
    vm.updateActivity = updateActivity;
    vm.saveUpdatedActivityDetail = saveUpdatedActivityDetail;
    vm.deleteActivity = deleteActivity;
    vm.searchActivity = searchActivity;
    
   
    vm.userName = $localStorage.userInfo.data[0].Name;
   /* vm.saveUpdatedUserDetail = saveUpdatedUserDetail;*/
    vm.showNewActivityForm = showNewActivityForm;
  /*  vm.showFormForNewUser = showFormForNewUser;*/
    vm.closeModel = closeModel;
  
    vm.openMap = openMap;
    vm.activityDetail = [];
    vm.userList = [];

    if($localStorage.userInfo.data[0].Name != '' || $localStorage.userInfo.data[0].Name != null){
         $localStorage.userlogin = true;

    }
    showActivity();
/*    showUser();*/
   
    vm.addActivityIcon = true;
    vm.addUserIcon = false;
    vm.userAdded = false
    vm.useraddSpinner = false;


   /* $scope.tabs = [{
            title: 'Upcoming Classes',
            url: 'addClass.html'
        }, {
            title: 'test',
            url: 'people.html'
        } ];

    $scope.currentTab = 'addClass.html';

    $scope.onClickTab = function (tab) {
        if(tab.url == "addClass.html"){
            vm.addActivityIcon = true;
            vm.addUserIcon = false
        }
        if(tab.url == "people.html"){
            vm.addActivityIcon = false;
            vm.addUserIcon = true

        }
        $scope.currentTab = tab.url;
    }
    
    $scope.isActiveTab = function(tabUrl) {
        return tabUrl == $scope.currentTab;
    }*/

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
        })
        
        vm.editActivity = activity;


        $ionicModal.fromTemplateUrl('editActivity.html', {
            scope: $scope,
        }).then(function(modal) {
            $scope.modal = modal;
            $scope.modal.show();
        });
 
    }

    function saveUpdatedActivityDetail(updatedActivity){
        updatedActivity.Coordinator_url = $localStorage.userInfo.data[0]._url;    
         userInfoService.updateActivity(updatedActivity).then(function(data){
            $scope.modal.hide();
         },function(error){
            console.log(error);
         });
    }

    function deleteActivity(activityToDelete){
        userAuthenticationService.confirm('','Do You Want To Delet Activity?','Yes','No',function(){
            userInfoService.deleteActivity(activityToDelete).then(function(data){
                showActivity();
            },function(error){
                console.log(error);
            });
        },null)
        
    }

    function showActivity(){
        console.log('$localStorage.userInfo.data[0].SB_Region',$localStorage.userInfo.data[0].SB_Region);
        userInfoService.getUserActivities($localStorage.userInfo.data[0].SB_Region).then(function(activityData){
            vm.activityData = activityData.data;
            console.log("this s activity", vm.activityData);
        },function(error){
            console.log(error);
        });
    }

    function closeModel(){
          $scope.modal.hide();  
    }  

    /*function showUser(){
        userInfoService.getUser().then(function(userlist){
            vm.userlist = userlist;
        },function(error){
            console.log('Error in getting all userList',error);
        })
    }*/

   

   

    

    function showNewActivityForm(){
        $ionicHistory.nextViewOptions({
            disableBack: true
        });
         $state.go('app.addActivity',{},{location: false, inherit: false});
    }

    /*function addNewUser(userDetail){
        vm.NewUserData = [];
        vm.useraddSpinner = true;

        var newUserDetail = [];
        newUserDetail = userDetail;
         userInfoService.addNewUser(newUserDetail).then(function(data){
             vm.useraddSpinner = false;
                 vm.userAdded = true;
                 $timeout(function () { vm.userAdded = false; }, 1000); 

          },function(error){
               console.log('error');
          })
    }*/

   /* function showFormForNewUser(){
        userRole();
        $ionicModal.fromTemplateUrl('newUsersForm.html', {
            scope: $scope
        }).then(function(modal) {
            $scope.modal = modal;
            $scope.modal.show();
        });
 
    }*/
    function userRole(){
        userInfoService.getUserRole().then(function(userRole){
            vm.userRole = userRole.data;
        },function(error){
             console.log(error);
        })
    }
    function openMap(address){
        var locationAddress = [];
        if(address.Address_line1){
             locationAddress.push(address.Address_line1)
        }
        if(address.Address_line2){
             locationAddress.push(address.Address_line2)
        }
        if(address.Locality){
            locationAddress.push(address.Locality)
        }
         if(address.District){
            locationAddress.push(address.District)
        }
         if(address.City){
            locationAddress.push(address.City)
        }
        if(address.State){
            locationAddress.push(address.State)
        }
        if(address.Country){
            locationAddress.push(address.Country)
        }
        if(address.Postal_code){
            locationAddress.push(address.Postal_code)
        }
     
        var Completeaddress=""
        for (var i = 0; i < locationAddress.length; i++) {
            locationAddress[i]
            Completeaddress = Completeaddress+ locationAddress[i]
        }
        window.open("http://maps.google.com/?q=" + Completeaddress, '_system');
    }

    function searchActivity(criteria){
        console.log('vm.search',criteria);
        if(!criteria.state){
            criteria.state =''
        }
        if(!criteria.city){
            criteria.city =''
        }
       
console.log("fina",criteria);



        activityService.searchForActivity(criteria).then(function(activityDetail){
            console.log("criteria",activityDetail);
            
            vm.activityData = activityDetail.data;
        },function(error){
            console.log("Error in updating FacebookID")
        })
    }

}

