angular
.module('starter')
.controller('userDetailController', userDetailController);

userDetailController.$inject = ['$scope', '$stateParams', '$state', 'userInfoService', '$ionicHistory', '$localStorage','userAuthenticationService','$ionicModal', '$timeout','filterFilter'];

function userDetailController($scope, $stateParams, $state, userInfoService, $ionicHistory,$localStorage,userAuthenticationService,$ionicModal,$timeout,filterFilter) {
	var vm = this;
	 vm.updateUser = updateUser;
	vm.searchUser = searchUser;
	vm.closeModel = closeModel;
	vm.role = $localStorage.userInfo.data[0].Role;
	vm.saveUpdatedUserDetail = saveUpdatedUserDetail;
	vm.deleteUser = deleteUser;
     vm.addNewUser = addNewUser;
    vm.showFormForNewUser = showFormForNewUser;

	  vm.showSearchCount = false;
       vm.userAdded = false
    vm.useraddSpinner = false;
     vm.userExit = false;
    userRole();
	function searchUser(criteria){
		console.log('vm.search',criteria);
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
console.log("fina",criteria);



		userInfoService.searchForUser(criteria).then(function(userDetail){
            console.log("criteria",userDetail);
             vm.showSearchCount = true;
            vm.user = userDetail;
            console.log("ths s result",vm.user);

        /*   // pagination controls
  $scope.currentPage = 1;
  $scope.totalItems = vm.user.data.length;
  $scope.entryLimit = 2; // items per page
  $scope.noOfPages = Math.ceil($scope.totalItems / $scope.entryLimit);

  // $watch search to update pagination
  $scope.$watch('search', function (newVal, oldVal) {
    console.log('newVal',newVal);
    console.log('oldVal',oldVal);
    $scope.filtered = filterFilter( vm.user.data, newVal);
    $scope.totalItems = $scope.filtered.length;
    $scope.noOfPages = Math.ceil($scope.totalItems / $scope.entryLimit);
    $scope.currentPage = 1;
  }, true);*/

        },function(error){
            console.log("Error in updating FacebookID")
        })
	}
  $scope.search = {};

  $scope.resetFilters = function () {
    // needs to be a function or it won't trigger a $watch
    $scope.search = {};
  };

  
	 function updateUser(userDetail){
	 	console.log("update",userDetail);
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
            $scope.modal.show();
        });
        $scope.closeModal = function() {
            $scope.modal.hide();
        };
    }

    function userRole(){
        userInfoService.getUserRole().then(function(userRole){
            vm.userRole = userRole.data;
        },function(error){
             console.log(error);
        })
    }

    function closeModel(){
          $scope.modal.hide();  
    } 

    function saveUpdatedUserDetail(updatedUserDetail){
         userInfoService.updateUserDetail(updatedUserDetail).then(function(data){
            $scope.modal.hide();
         },function(error){
            console.log(error);
         });
    }

     function deleteUser(user){
        userAuthenticationService.confirm('','Do You Want To Delet This User?','Yes','No',function(){
            userInfoService.deleteActivity(user).then(function(data){
                searchUser(vm.search);
            },function(error){
                console.log(error);
            });
        },function(){

        })
        
    }

    function userRole(){
        userInfoService.getUserRole().then(function(userRole){
            vm.userRole = userRole.data;
        },function(error){
             console.log(error);
        })
    }

    function showFormForNewUser(){
        userRole();
        $ionicModal.fromTemplateUrl('newUsersForm.html', {
            scope: $scope
        }).then(function(modal) {
            $scope.modal = modal;
            $scope.modal.show();
        });
 
    }

    function addNewUser(userDetail){
        vm.NewUserData = [];
        vm.useraddSpinner = true;
         vm.userExit = false;
        var newUserDetail = [];
/*        newUserDetail = userDetail;
*/        userAuthenticationService.emailauthentication(userDetail.Email).then(function(userData){
            console.log("length",userData.data.length);
            console.log(userData.data.length > 0);
            if(userData.data.length > 0){
vm.userExit = true;
                
            }else{
                
                userInfoService.addNewUser(newUserDetail).then(function(data){
                vm.useraddSpinner = false;
                 vm.userAdded = true;
                 $timeout(function () { vm.userAdded = false; }, 1000); 

                  },function(error){
                       console.log('error');
                  })
            }

        })
         /*userInfoService.addNewUser(newUserDetail).then(function(data){
             vm.useraddSpinner = false;
                 vm.userAdded = true;
                 $timeout(function () { vm.userAdded = false; }, 1000); 

          },function(error){
               console.log('error');
          })*/
    }
}