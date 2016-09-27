angular
.module('starter')
.controller('organizerController', organizerController);

organizerController.$inject = ['$scope', '$stateParams', '$state','userInfoService','$ionicModal','userAuthenticationService', 'projectService', '$localStorage','$ionicHistory','$timeout' ,'activityService' ,'filterFilter','$rootScope','setLocationService','$filter'];

function organizerController($scope, $stateParams, $state, userInfoService, $ionicModal, userAuthenticationService, projectService, $localStorage,$ionicHistory,$timeout,activityService,filterFilter,$rootScope,setLocationService,$filter) {
    var vm = this;

    vm.showSpinner = true;
    vm.detailAboutActivity = detailAboutActivity;
    vm.updateActivity = updateActivity;
    vm.deleteActivity = deleteActivity;
    vm.searchActivity = searchActivity;
    vm.routingTOMapView = routingTOMapView;
    $rootScope.currentMenu = 'organizerActivity';
    vm.showNewActivityForm = showNewActivityForm;
    vm.closeModel = closeModel;
    vm.searchLevelChangeEvent = searchLevelChangeEvent;

    vm.openMap = openMap;
    vm.activityDetail = [];
    vm.userList = [];
     vm.search = {
        subRegion : true,
        Region_url: ''
     };
    $scope.dataLoading = true;
    if($localStorage.userInfo.data[0].Name != '' || $localStorage.userInfo.data[0].Name != null){
        $localStorage.userlogin = true;

    }
    showActivity();
    if($localStorage.sbRegionPath){
          getRegionsByurl($localStorage.sbRegionPath);

    }

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
        $ionicHistory.nextViewOptions({
            disableBack: true
        });
        $state.go('app.editactivity',{'editdata': activity},{location: false, inherit: false});
    }

    function deleteActivity(activityToDelete){
        userAuthenticationService.confirm('','Do You Want To Delet Activity?','Yes','No',function(){
            vm.showSpinner = true;
            userInfoService.deleteActivity(activityToDelete).then(function(data){
                userAuthenticationService.alertUser('Activity Deleted');
                showActivity();
            },function(error){
                userAuthenticationService.alertUser('Error Occured');
                console.log(error);
            });
        },null)

    }

    function showActivity(){
        vm.showSpinner = true;
        userInfoService.getUserActivities($localStorage.userInfo.data[0].Region_url).then(function(activityData){
            vm.activityData = activityData.data;
            $scope.currentPage = 1;
            $scope.totalItems = vm.activityData.length;
            $scope.entryLimit = 10; 
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
        if(criteria){
            vm.showSpinner = true;
            if(!criteria.state){
                criteria.state =''
            }
            if(!criteria.city){
                criteria.city =''
            }
            if(!criteria.Region_url){
                criteria.Region_url =''
            }
            if(criteria.Region_url){
                criteria.Region_url = vm.reginPathSelected;
            }
            if(!criteria.subRegion){
                criteria.subRegion = ''
            }

            activityService.searchForActivity(criteria).then(function(activityDetail){  
                  if(activityDetail.data.length > 0){
                     vm.search.Region_url = vm.currentPath;          
                        vm.activityData = activityDetail.data;
                  }else{
                    vm.search.Region_url = vm.currentPath;
                    userAuthenticationService.alertUser('No Matches');
                  }
               
                vm.showSpinner = false;
            },function(error){
                vm.search.Region_url = vm.currentPath;
                console.log("Error in updating FacebookID")
            })
        }
    }

    function routingTOMapView(activityData){
        $ionicHistory.nextViewOptions({
            disableBack: true
        });
        $state.go('app.activitymapview',{'activitys':activityData, 'type' : 'activitInfos'},{location: false, inherit: false});
    }

    function searchLevelChangeEvent(){
        getRegionsByurl(vm.search.Region_url);
    }

    function getRegionsByurl(region_url){
        if(region_url){
            vm.reginPathSelected = region_url;
            setLocationService.getRegionsByurl(region_url).then(function(reginUrlServiceRes){
                var listData = [];
            
                vm.search.Region_url = reginUrlServiceRes.data.path;
                vm.currentPath = reginUrlServiceRes.data.path
                parentData = {
                  'name': 'Up One Level',
                  'value': reginUrlServiceRes.data.Parent_region_url,
                }

                angular.forEach(reginUrlServiceRes.data.Subregions, function (key, index) {
                    var DataSructure = {
                        'name': index,
                        'value': key,
                    }
                    listData.push(DataSructure);
                });

                var filterValue = $filter('orderBy')(listData, 'name');

                vm.nextLevelData= [];
                vm.nextLevelData.push(parentData);
                angular.forEach(filterValue, function (key, index) {
                    vm.nextLevelData.push(key);
                })

                

            },function(error){
                console.log(error);
            })
        }
    }   

}

