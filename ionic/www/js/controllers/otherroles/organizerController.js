angular
.module('starter')
.controller('organizerController', organizerController);

organizerController.$inject = ['$scope', '$stateParams', '$state','userInfoService','$ionicModal','userAuthenticationService', 'projectService', '$localStorage','$ionicHistory','$timeout' ,'activityService' ,'filterFilter','$rootScope'];

function organizerController($scope, $stateParams, $state, userInfoService, $ionicModal, userAuthenticationService, projectService, $localStorage,$ionicHistory,$timeout,activityService,filterFilter,$rootScope) {
    var vm = this;

    vm.showSpinner = true;
    vm.detailAboutActivity = detailAboutActivity;
    vm.updateActivity = updateActivity;
    vm.saveUpdatedActivityDetail = saveUpdatedActivityDetail;
    vm.deleteActivity = deleteActivity;
    vm.searchActivity = searchActivity;
    vm.routingTOMapView = routingTOMapView;
    $rootScope.currentMenu = 'organizerActivity';

    vm.showNewActivityForm = showNewActivityForm;
    vm.closeModel = closeModel;

    vm.openMap = openMap;
    vm.activityDetail = [];
    vm.userList = [];
    $scope.dataLoading = true;
    if($localStorage.userInfo.data[0].Name != '' || $localStorage.userInfo.data[0].Name != null){
        $localStorage.userlogin = true;

    }
    showActivity();

    vm.addActivityIcon = true;
    vm.addUserIcon = false;
    vm.userAdded = false
    vm.useraddSpinner = false;

    function detailAboutActivity(activity){ 
        $ionicHistory.nextViewOptions({
            disableBack: true
        });
        $state.go('app.activityDetail',{'activityDetail':activity},{location: false, inherit: false});
    }


    function updateActivity(activity){
        vm.showSpinner = true;
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
            vm.showSpinner = false;
            $scope.modal.show();
        });

    }

    function saveUpdatedActivityDetail(updatedActivity){
        vm.showSpinner = true;
        updatedActivity.Coordinator_url = $localStorage.userInfo.data[0]._url;    
        userInfoService.updateActivity(updatedActivity).then(function(data){
            vm.showSpinner = false;
            $scope.modal.hide();
        },function(error){
            console.log(error);
        });
    }

    function deleteActivity(activityToDelete){
        userAuthenticationService.confirm('','Do You Want To Delet Activity?','Yes','No',function(){
            vm.showSpinner = true;
            userInfoService.deleteActivity(activityToDelete).then(function(data){
                showActivity();
            },function(error){
                console.log(error);
            });
        },null)

    }

    function showActivity(){
        vm.showSpinner = true;
        userInfoService.getUserActivities($localStorage.userInfo.data[0].SB_Region).then(function(activityData){
            vm.activityData = activityData.data;

            $scope.currentPage = 1;
            $scope.totalItems = vm.activityData.length;
            $scope.entryLimit = 5; 
            $scope.noOfPages = Math.ceil($scope.totalItems / $scope.entryLimit);

            $scope.$watch('search', function (newVal, oldVal) {
                $scope.filtered = filterFilter(vm.activityData, newVal);
                $scope.totalItems = $scope.filtered.length;
                $scope.noOfPages = Math.ceil($scope.totalItems / $scope.entryLimit);
                $scope.currentPage = 1;
                vm.showSpinner = false;
            }, true);

        },function(error){
            console.log(error);
        }).finally(function () {
            vm.showSpinner = false;
        });
    }

    function closeModel(){
        $scope.modal.hide();  
    }  


    function showNewActivityForm(){
        $ionicHistory.nextViewOptions({
            disableBack: true
        });
        $state.go('app.addActivity',{},{location: false, inherit: false});
    }

    function userRole(){
        vm.showSpinner = true;
        userInfoService.getUserRole().then(function(userRole){
            vm.userRole = userRole.data;
            vm.showSpinner = false;
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
        console.log("!criteria",!criteria);
         if(criteria){
            vm.showSpinner = true;
            if(!criteria.state){
                criteria.state =''
            }
            if(!criteria.city){
                criteria.city =''
            }

            activityService.searchForActivity(criteria).then(function(activityDetail){            
                vm.activityData = activityDetail.data;
                vm.showSpinner = false;
            },function(error){
                console.log("Error in updating FacebookID")
            })
        }
    }

    function routingTOMapView(activityData){
        $ionicHistory.nextViewOptions({
            disableBack: true
        });
      /*  $state.go('app.activitymapview');*/
         $state.go('app.activitymapview',{'activitys':activityData},{location: false, inherit: false});
    }

    
}

