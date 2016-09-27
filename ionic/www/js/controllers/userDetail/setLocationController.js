angular
.module('starter')
.controller('setLocationController', setLocationController);

setLocationController.$inject = ['$scope', '$state', '$localStorage', '$ionicHistory','$rootScope','projectService','coursesService', '$ionicModal','userInfoService','filterFilter','setLocationService','$filter'];

function setLocationController($scope, $state, $localStorage,$ionicHistory,$rootScope,projectService,coursesService, $ionicModal,userInfoService,filterFilter,setLocationService,$filter) {
    var vm = this;
/*    vm.leftArrowClick = leftArrowClick;
*/    vm.levelChangeEvent = levelChangeEvent;
   
    vm.showSetLocationForm = showSetLocationForm;
    vm.searchUser = searchUser;
    vm.choosedCoordinator = choosedCoordinator;
    vm.seacrchForCoordinator = seacrchForCoordinator;
    vm.addNewLocation = addNewLocation;
    vm.coordinatorDetail = coordinatorDetail;
    vm.closeModel = closeModel;

    vm.showSpinner = false;
    vm.fieldEditable = true;
    vm.edititemtrue = true;
    vm.edititem = false;
    vm.showEditButton = true;
    vm.showUpdateButn = false;
    vm.nonEditableField = true;



    vm.regionDetail;
   
    getPraanthTypes();
    console.log("$localStorage.userInfo.data[0].Region_url",$localStorage.userInfo.data[0].Region_url);
    getRegionsByurl($localStorage.sbRegionPath);

    if($localStorage.userInfo.data[0].Name != '' || $localStorage.userInfo.data[0].Name != null){
        $localStorage.userlogin = true;
    }
    $rootScope.currentMenu = 'setLocation';

    console.log("$localStorage.userInfo",$localStorage.userInfo);


function levelChangeEvent(){
    console.log("levelChangeEvent");
    console.log("selectedData",vm.selectedData);
    getRegionsByurl(vm.selectedData);
}




/*

function leftArrowClick(){
    console.log("selectedData",vm.regionDetail.Parent_region_url);
    getRegionsByurl(vm.regionDetail.Parent_region_url);

    console.log("vm.subreginUrl", vm.regionDetail.Parent_region_url);

    setLocationService.getRegionsByurl(vm.regionDetail.Parent_region_url).then(function(parentRegionDetail){
        console.log("parentRegion",parentRegionDetail);

        vm.myRegionPath = parentRegionDetail.data.path;
        vm.regionDetail = parentRegionDetail.data;
        vm.nextLevelData =  parentRegionDetail.data.Subregions
         userInfoService.getActivityCoordinatorDetail(vm.regionDetail.Coordinator_url).then(function(coordinatorDetails){
            vm.showSpinner = false;
            console.log("coordinatorDetails",coordinatorDetails);
            vm.userProfileInfo = coordinatorDetails.data;
            vm.regionDetail.Coordinator_url = coordinatorDetails.data.Name;
        },function(error){
            console.log('error',error);
        });

    },function(error){
        console.log(error);
    })


}*/



function getRegionsByurl(region_url){

    if(region_url){


    setLocationService.getRegionsByurl(region_url).then(function(reginUrlServiceRes){
        var listData = [];
        vm.regionDetail = reginUrlServiceRes.data;
        vm.subreginUrl = reginUrlServiceRes.data.Parent_region_url;
        vm.myRegionPath =  reginUrlServiceRes.data.path;
         /*vm.nextLevelData =  reginUrlServiceRes.data.Subregions;*/
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


       /* if(!reginUrlServiceRes.data.Subregions){
            console.log("no sub regin")
            vm.showDropDown = false;
        }else{
             vm.showDropDown = true;
        }*/

        if(reginUrlServiceRes.data.Coordinator_url){
            userInfoService.getActivityCoordinatorDetail(reginUrlServiceRes.data.Coordinator_url).then(function(coordinatorDetails){
            vm.showSpinner = false;
            console.log("coordinatorDetails",coordinatorDetails);
            vm.userProfileInfo = coordinatorDetails.data;
            vm.regionDetail.Coordinator_url = coordinatorDetails.data.Name;
            },function(error){
                console.log('error',error);
            });
         }

    },function(error){
        console.log(error);
    })
      }
}

function showSetLocationForm(){
    $ionicModal.fromTemplateUrl('setLocationForm.html', {
        scope: $scope,
    }).then(function(modal) {
        $scope.modal = modal;
        vm.showSpinner = false;
        $scope.modal.show();
    });
}

function seacrchForCoordinator(){
    $ionicModal.fromTemplateUrl('chooseCoordinator.html', {
        scope: $scope,
    }).then(function(modal) {
        $scope.modal = modal;
        vm.showSpinner = false;
        $scope.modal.show();
    });
}

function searchUser(criteria){ 
    vm.showSpinner = true;
    if(!criteria){
        userInfoService.getUser().then(function(userDetail){
            vm.showSearchCount = true;
            vm.user = userDetail;
            $scope.currentPage = 1;
            $scope.totalItems = userDetail.data.length;
            $scope.entryLimit = 5; 
            $scope.noOfPages = Math.ceil($scope.totalItems / $scope.entryLimit);

            $scope.$watch('search', function (newVal, oldVal) {
                $scope.filtered = filterFilter(vm.user.data, newVal);
                $scope.totalItems = $scope.filtered.length;
                $scope.noOfPages = Math.ceil($scope.totalItems / $scope.entryLimit);
                $scope.currentPage = 1;
                vm.showSpinner = false;
            }, true);

        },function(error){
            console.log("Error in updating FacebookID")
        })

    }else{

        if(!criteria.name){
            criteria.name =''
        }
        if(!criteria.email){
            criteria.email =''
        }
        if(!criteria.phone){
            criteria.phone =''
        }
        if(!criteria.address){
            criteria.address =''
        }
        if(!criteria.role){
            criteria.role =''
        }
        if(!criteria.city){
            criteria.city =''
        }
        if(!criteria.country){
            criteria.country =''
        }
        if(!criteria.city){
            criteria.city =''
        }
        userInfoService.searchForUser(criteria).then(function(userDetail){
            if(userDetail.data.length > 0){
                vm.showSearchCount = true;
                vm.user = userDetail;
                $scope.currentPage = 1;
                $scope.totalItems = userDetail.data.length;
                $scope.entryLimit = 10; 
                $scope.noOfPages = Math.ceil($scope.totalItems / $scope.entryLimit);

                $scope.$watch('search', function (newVal, oldVal) {

                    $scope.filtered = filterFilter(vm.user.data, newVal);
                    $scope.totalItems = $scope.filtered.length;
                    $scope.noOfPages = Math.ceil($scope.totalItems / $scope.entryLimit);
                    $scope.currentPage = 1;
                    vm.showSpinner = false;
                }, true);
            }else{
                userAuthenticationService.alertUser('No Matches');
                vm.showSpinner = false;
            }
        },function(error){
            console.log("Error in updating FacebookID")
        })
    }
}

function choosedCoordinator(choosedData,type){
    $scope.modal.hide();
    console.log("choosedData",choosedData);
    vm.coordinatorName = choosedData.Name;
    vm.newLocation.Coordinator_url = choosedData._url;
}

function addNewLocation(){
    console.log("vm.newLocation",vm.newLocation);
}

function getPraanthTypes(){
    setLocationService.getAllPraantaType().then(function(paraantaTypeServiceRes){
        vm.praantaTypes = paraantaTypeServiceRes.data;
    },function(error){
        console.log(error);
    })
}

function coordinatorDetail(){
    $ionicModal.fromTemplateUrl('templates/selectedUserDetail.html', {
        scope: $scope,
    }).then(function(modal) {
        $scope.modal = modal;
        vm.showSpinner = false;
        $scope.modal.show();
    });
}

function closeModel(){
    $scope.modal.hide();  
}

}