angular
.module('starter')
.controller('studentController', studentController);

studentController.$inject = ['$scope', '$stateParams', '$state', '$location', '$localStorage', 'userInfoService' ,'activityService','$ionicHistory' ,'userAuthenticationService', 'filterFilter','$rootScope'];

function studentController($scope, $stateParams, $state, $location, $localStorage, userInfoService, activityService, $ionicHistory,userAuthenticationService,filterFilter,$rootScope) {
    var vm = this;

    vm.detailAboutActivity = detailAboutActivity;
    vm.joinActivity = joinActivity;
    vm.openMap = openMap;
    vm.updateActivityInfo = updateActivityInfo;
    vm.searchActivity = searchActivity;
    vm.routingTOMapView = routingTOMapView;
    vm.showSpinner = true;
    vm.activityNewList = [];
    $rootScope.currentMenu = 'StudentUpcomingActivity';
    if($localStorage.userInfo.data[0].Name != '' || $localStorage.userInfo.data[0].Name != null){
        $localStorage.userlogin = true;

    }
    showActivity();

    function showActivity(){
        vm.showSpinner = true;
        userInfoService.getUserActivities($localStorage.userInfo.data.SB_Region).then(function(activityData){
            vm.activityData = activityData.data;
            userInfoService.getUserClassList($localStorage.userInfo.data[0]._url).then( function (studentClass){
                vm.showSpinner = false;
                angular.forEach(activityData.data, function (key, index) {
                    var result = $.grep(studentClass.data, function (packState) {
                        return  packState.Activity_url == key._url;
                    });
                    if (result && result.length > 0) {
                        activityWithEnrollStructure(key,result[0]);
                    }
                    else {
                        activityWithOutEnrollStructure(key);
                    }

                })

                $scope.currentPage = 1;
                $scope.totalItems = vm.activityNewList.length;
                $scope.entryLimit = 5; 
                $scope.noOfPages = Math.ceil($scope.totalItems / $scope.entryLimit);

                $scope.$watch('search', function (newVal, oldVal) {

                    $scope.filtered = filterFilter(vm.activityNewList, newVal);
                    $scope.totalItems = $scope.filtered.length;
                    $scope.noOfPages = Math.ceil($scope.totalItems / $scope.entryLimit);
                    $scope.currentPage = 1;
                    vm.showSpinner = false;
                }, true);

            },function(error){
                console.log('error in getting student class',error);
            })
        },function(error){
            console.log(error);
        });
    }

    $scope.search = {};

    $scope.resetFilters = function () {
        $scope.search = {};
    };

    function detailAboutActivity(activity){ 
        $ionicHistory.nextViewOptions({
            disableBack: true
        });
        $state.go('app.activityDetail',{'activityDetail':activity},{location: false, inherit: false});
    }

    function joinActivity(activityTOjoin,state){
        userAuthenticationService.confirm('','Do You Want To Join Activity?','Yes','No',function(){
            vm.showSpinner = true;

            if(state == "Confirmed"){
                vm.joinbtn = activityTOjoin._url
                var newJoindActivity = {
                    Activity_url: activityTOjoin._url, 
                    Person_url: $localStorage.userInfo.data[0]._url, 
                    EventRole:  'Student',
                    Status:'Confirmed',
                    Last_active_date:new Date()
                }
            }else{
                vm.tentativebtn = activityTOjoin._url
                var newJoindActivity = {
                    Activity_url: activityTOjoin._url, 
                    Person_url: $localStorage.userInfo.data[0]._url, 
                    EventRole:  'Student',
                    Status:'Tentative',
                    Last_active_date:new Date()
                }
            }

            activityService.joinActivity(newJoindActivity).then(function(data){
                console.log("test",data);
                vm.showSpinner = false;

            },function(error){
                console.log(error);
            })

        },function(){
            vm.showSpinner = false;

        })

    }

    function activityWithEnrollStructure(activity,myactivity){
        var _activityDetail = {
            allActivity : activity,
            myActivity : myactivity
        }
        vm.activityNewList.push(_activityDetail);
    }

    function activityWithOutEnrollStructure(activity){
        var _activityDetail = {
            allActivity : activity,
            myActivity : ""               
        }
        vm.activityNewList.push(_activityDetail);
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
        console.log("Completeaddress",Completeaddress)
        window.open("http://maps.google.com/?q=" + Completeaddress, '_system');
    }

    function updateActivityInfo(activityTOjoin){
        vm.showSpinner = true;
        vm.joinbtn = activityTOjoin.allActivity._url
        vm.joinedbtn = activityTOjoin.allActivity._url;
        var newJoindActivity = {
            Activity_url: activityTOjoin.myActivity.Activity_url, 
            Person_url:  $localStorage.userInfo.data[0]._url, 
            Status:'Confirmed',
            Last_active_date:new Date(),
            _url: activityTOjoin.myActivity._url
        }
        activityService.updateActivity(newJoindActivity,activityTOjoin.myActivity._url).then(function(data){
            vm.joinedbtn = activityTOjoin.myActivity._url;
            vm.showSpinner = false;
        },function(error){
            console.log(error);
        })
    }

    function searchActivity(criteria){
        vm.showSpinner = true;
        if(!criteria.state){
            criteria.state =''
        }
        if(!criteria.city){
            criteria.city =''
        }

        activityService.searchForActivity(criteria).then(function(activityDetail){
            activitySearchResult(activityDetail)
        },function(error){
            console.log("Error in updating FacebookID")
        })
    }

    function activitySearchResult(activityData){
        vm.showSpinner = true;
        vm.activityNewList  =[]
        userInfoService.getUserClassList($localStorage.userInfo.data[0]._url).then( function (studentClass){
            vm.showSpinner = false;

            angular.forEach(activityData.data, function (key, index) {
                var result = $.grep(studentClass.data, function (packState) {
                    return  packState.Activity_url == key._url;
                });
                if (result && result.length > 0) {
                    activityWithEnrollStructure(key,result[0]);
                }
                else {
                    activityWithOutEnrollStructure(key);
                }

            })
        },function(error){
            console.log('error in getting student class',error);
        })
    }

   
        function routingTOMapView(activityInfo){
            var activityList = [];
       angular.forEach(activityInfo, function (key, index) {
        activityList.push(key.allActivity);
       })
        $ionicHistory.nextViewOptions({
            disableBack: true
        });
         $state.go('app.activitymapview',{'activitys':activityList},{location: false, inherit: false});
    }
    

}