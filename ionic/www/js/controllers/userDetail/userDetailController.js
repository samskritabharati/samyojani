angular
.module('starter')
.controller('userDetailController', userDetailController);

userDetailController.$inject = ['$scope', '$stateParams', '$state', 'userInfoService', '$ionicHistory', '$localStorage','userAuthenticationService','$ionicModal', '$timeout','filterFilter','$rootScope' ,'setLocationService','$filter'];

function userDetailController($scope, $stateParams, $state, userInfoService, $ionicHistory,$localStorage,userAuthenticationService,$ionicModal,$timeout,filterFilter,$rootScope,setLocationService,$filter) {
    var vm = this;
    vm.updateUser = updateUser;
    vm.searchUser = searchUser;
    vm.closeModel = closeModel;
    vm.role = $localStorage.userInfo.data[0].Role;
    vm.saveUpdatedUserDetail = saveUpdatedUserDetail;
    vm.deleteUser = deleteUser;
    vm.addNewUser = addNewUser;
    vm.showFormForNewUser = showFormForNewUser;
    vm.detailAboutUser = detailAboutUser;
    vm.routingTOMapView = routingTOMapView;
    vm.openMap = openMap;
    vm.levelChangeEvent = levelChangeEvent;
    vm.editLevelChangeEvent = editLevelChangeEvent;
    vm.searchLevelChangeEvent = searchLevelChangeEvent;

    vm.showSpinner = false;
    vm.showSearchCount = false;
    vm.userAdded = false
    vm.useraddSpinner = false;
    vm.userExit = false;
    $rootScope.currentMenu = 'usersDetail';
    userRole();

    vm.NewUserData = {
        Region_url: ''
    }
    vm.userDetailInfo = [];
     vm.showUserDetail = [];
     vm.search = {
        subRegion : true
     };
    
    console.log("$localStorage.userInfo",$localStorage.userInfo);

    if($localStorage.userInfo.data[0].Name != '' || $localStorage.userInfo.data[0].Name != null){
        $localStorage.userlogin = true;

    }

    if($localStorage.sbRegionPath){
          getRegionsByurl($localStorage.sbRegionPath);

    }

    function searchUser(criteria){ 
        vm.showSpinner = true;
        console.log("vm.search.subRegion",criteria.subRegion);
        if(!criteria){
            userInfoService.getUser().then(function(userDetail){
                vm.showSearchCount = true;
                vm.user = userDetail;
                $scope.currentPage = 1;
                $scope.totalItems = userDetail.data.length;
                $scope.entryLimit = 2; 
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
            if(!criteria.Region_url){
                criteria.Region_url =''
            }
            if(criteria.Region_url){
                criteria.Region_url = vm.reginPathSelected;
            }
            if(!criteria.subRegion){
                criteria.subRegion = ''
            }
            console.log("criteria",criteria)
            userInfoService.searchForUser(criteria).then(function(userDetail){
                vm.search.Region_url = vm.currentPath;
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
                     vm.search.Region_url = vm.currentPath;
                    userAuthenticationService.alertUser('No Matches');
                    vm.showSpinner = false;
                }

            },function(error){
                console.log("Error in updating FacebookID")
            })
        }
    }
    $scope.search = {};

    $scope.resetFilters = function () {
        $scope.search = {};
    };

    function updateUser(userDetail){
        vm.showSpinner = true;
        vm.showUserDetail = userDetail;
        userAuthenticationService.getProfession().then(function(userProfession){
            vm.userProfessionList = userProfession;

        },function(error){
            console.log(error);
        })
        getRegionsByurl(userDetail.Region_url)

        userRole();
        $ionicModal.fromTemplateUrl('editUser.html', {
            scope: $scope
        }).then(function(modal) {
            $scope.modal = modal;
            vm.showSpinner = false;
            $scope.modal.show();
        });
        $scope.closeModal = function() {
            $scope.modal.hide();
        };
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

    function closeModel(){
        $scope.modal.hide();  
    } 

    function saveUpdatedUserDetail(updatedUserDetail){
        updatedUserDetail.Region_url=  vm.reginPathSelected
        vm.showSpinner = true;
        userInfoService.updateUserDetail(updatedUserDetail).then(function(data){
            console.log("updateres",data);
            userAuthenticationService.alertUser('Details Updated');
            vm.showSpinner = false;
            $scope.modal.hide();
        },function(error){
            userAuthenticationService.alertUser('Error Occurred');
            console.log(error);
        });
    }

    function deleteUser(user){
        userAuthenticationService.confirm('','Do You Want To Delet This User?','Yes','No',function(){
            vm.showSpinner = true;
            userInfoService.deleteActivity(user).then(function(data){
                userAuthenticationService.alertUser('User Deleted');
                searchUser(vm.search);

            },function(error){
                userAuthenticationService.alertUser('Error Occurred');
                console.log(error);
            });
        },function(){

        })

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

    function showFormForNewUser(){
        vm.showSpinner = true;
        userRole();
        $ionicModal.fromTemplateUrl('newUsersForm.html', {
            scope: $scope
        }).then(function(modal) {
            $scope.modal = modal;
            vm.showSpinner = false;
            $scope.modal.show();
        });

    }

    function addNewUser(userDetail){
        vm.NewUserData = [];
        vm.showSpinner = true;
        if(userDetail.Email){
            userAuthenticationService.emailauthentication(userDetail.Email).then(function(userData){
                if(userData.data.length > 0){
                     vm.showSpinner = false;
                     userAuthenticationService.alertUser('User Already Enrolled');
                }else{
                    var newDetail = {
                        Name: userDetail.Name,
                        Email: userDetail.Email,
                        Phone: userDetail.Phone,
                        Role : userDetail.Role,
                        Region_url:  vm.reginPathSelected
                    }

                    userInfoService.addNewUser(newDetail).then(function(data){
                        console.log("return,data",data);
                         vm.showSpinner = false;
                        userAuthenticationService.alertUser('User Added');
                         getRegionsByurl($localStorage.sbRegionPath);
                      /*  vm.useraddSpinner = false;
                        vm.userAdded = true;
                        $timeout(function () { vm.userAdded = false; }, 1000); */

                    },function(error){
                         vm.showSpinner = false;
                        userAuthenticationService.alertUser('Error Occurred');
                        console.log('error');
                    });
                }

            })
        }else{
            if(userDetail.Phone){
                userAuthenticationService.phoneauthentication(userDetail.Phone).then(function(userData){
                    if(userData.data.length > 0){
                         vm.showSpinner = false;
                         userAuthenticationService.alertUser('User Already Enrolled');
                      /*  vm.userExit = true;
                        $timeout(function () { vm.userExit = false; }, 1000); */
                    }else{
                        var newDetail = {
                            Name: userDetail.Name,
                            Email: userDetail.Email,
                            Phone: userDetail.Phone,
                            Role : userDetail.Role,
                            Region_url:  vm.reginPathSelected
                        }
                        userInfoService.addNewUser(newDetail).then(function(data){
                             console.log("return,data",data);
                             vm.showSpinner = false;
                            userAuthenticationService.alertUser('User Added');
                            getRegionsByurl($localStorage.sbRegionPath);
                           /* vm.useraddSpinner = false;
                            vm.userAdded = true;
                            $timeout(function () { vm.userAdded = false; }, 1000);*/ 

                        },function(error){
                             vm.showSpinner = false;
                            userAuthenticationService.alertUser('Error Occurred');
                            console.log('error');
                        });
                    }

                })
            }
        }
    }

    function detailAboutUser(user){
        vm.userDetailInfo = [];
        vm.userDetailInfo = user;
        console.log("user",user);
        getRegionsByurl(user.Region_url);
        $ionicModal.fromTemplateUrl('userInfo.html', {
            scope: $scope
        }).then(function(modal) {
            $scope.modal = modal;
            vm.showSpinner = false;
            $scope.modal.show();
        });
        $scope.closeModal = function() {
            $scope.modal.hide();
        };
    }

    function routingTOMapView(userData){
        $ionicHistory.nextViewOptions({
            disableBack: true
        });
        $state.go('app.activitymapview',{'activitys':userData, 'type' : 'userInfo'},{location: false, inherit: false});
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

    function levelChangeEvent(){
        console.log("levelChangeEvent");
        console.log("selectedData",vm.NewUserData.Region_url);
        getRegionsByurl(vm.NewUserData.Region_url);
    }

    
    function editLevelChangeEvent(){
        console.log("levelChangeEvent");
        console.log("selectedData",vm.showUserDetail.Region_url);
        getRegionsByurl(vm.showUserDetail.Region_url);
    }

    function searchLevelChangeEvent(){
        getRegionsByurl(vm.search.Region_url);
    }

    function getRegionsByurl(region_url){
        if(region_url){
vm.reginPathSelected = region_url;
            setLocationService.getRegionsByurl(region_url).then(function(reginUrlServiceRes){
                var listData = [];
                vm.regionDetail = reginUrlServiceRes.data;
                vm.subreginUrl = reginUrlServiceRes.data.Parent_region_url;
               vm.NewUserData.Region_url =  reginUrlServiceRes.data.path;
               vm.userDetailInfo.Region_url = reginUrlServiceRes.data.path;
                vm.showUserDetail.Region_url = reginUrlServiceRes.data.path;
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