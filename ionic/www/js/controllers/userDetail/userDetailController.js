angular
.module('starter')
.controller('userDetailController', userDetailController);

userDetailController.$inject = ['$scope', '$stateParams', '$state', 'userInfoService', '$ionicHistory', '$localStorage','userAuthenticationService','$ionicModal', '$timeout','filterFilter','$rootScope'];

function userDetailController($scope, $stateParams, $state, userInfoService, $ionicHistory,$localStorage,userAuthenticationService,$ionicModal,$timeout,filterFilter,$rootScope) {
    var vm = this;
    vm.updateUser = updateUser;
    vm.searchUser = searchUser;
    vm.closeModel = closeModel;
    vm.role = $localStorage.userInfo.data[0].Role;
    vm.saveUpdatedUserDetail = saveUpdatedUserDetail;
    vm.deleteUser = deleteUser;
    vm.addNewUser = addNewUser;
    vm.showFormForNewUser = showFormForNewUser;
    vm.detailAboutUser = detailAboutUser

    vm.showSpinner = false;
    vm.showSearchCount = false;
    vm.userAdded = false
    vm.useraddSpinner = false;
    vm.userExit = false;
     $rootScope.currentMenu = 'usersDetail';
    userRole();

    if($localStorage.userInfo.data[0].Name != '' || $localStorage.userInfo.data[0].Name != null){
        $localStorage.userlogin = true;

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
            userInfoService.searchForUser(criteria).then(function(userDetail){
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
        vm.showSpinner = true;
        userInfoService.updateUserDetail(updatedUserDetail).then(function(data){
            vm.showSpinner = false;
            $scope.modal.hide();
        },function(error){
            console.log(error);
        });
    }

    function deleteUser(user){
        userAuthenticationService.confirm('','Do You Want To Delet This User?','Yes','No',function(){
            vm.showSpinner = true;
            userInfoService.deleteActivity(user).then(function(data){
                searchUser(vm.search);
            },function(error){
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
        vm.useraddSpinner = true;
        vm.userExit = false;
       /* var newDetail = [];
        newDetail = userDetail*/
        userAuthenticationService.emailauthentication(userDetail.Email).then(function(userData){
            if(userData.data.length > 0){
                vm.userExit = true;
                $timeout(function () { vm.userExit = false; }, 1000); 
            }else{
                var newDetail = {
                     Name: userDetail.Name,
                    Email: userDetail.Email,
                    Phone: userDetail.Phone,
                    Role : userDetail.Role
                }
                userInfoService.addNewUser(newDetail).then(function(data){
                    vm.useraddSpinner = false;
                    vm.userAdded = true;
                    $timeout(function () { vm.userAdded = false; }, 1000); 

                },function(error){
                    console.log('error');
                });
            }

        })

    }

    function detailAboutUser(user){
        vm.userDetailInfo = [];
        vm.userDetailInfo = user;
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
}