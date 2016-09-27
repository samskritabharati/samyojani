angular
.module('starter')
.controller('activityDetailController', activityDetailController);

activityDetailController.$inject = ['$scope', '$stateParams', '$state', 'userInfoService','$ionicModal','userAuthenticationService', '$localStorage', 'activityService','$timeout','$ionicHistory','filterFilter','$ionicPopup'];

function activityDetailController($scope, $stateParams, $state ,userInfoService, $ionicModal, userAuthenticationService, $localStorage, activityService,$timeout ,$ionicHistory,filterFilter,$ionicPopup) {
  var vm = this;
  vm.deleteUserFromActivity = deleteUserFromActivity;
  vm.updateUserDetailFromActivity = updateUserDetailFromActivity;
  vm.showFormToUpdatePerticipantInActivity = showFormToUpdatePerticipantInActivity;
  vm.closeModel = closeModel;
  vm.showAddPerticipantForm = showAddPerticipantForm;
  vm.addParticipentToActivity = addParticipentToActivity;
  vm.closeModelAndRefeshParticipant = closeModelAndRefeshParticipant;
  vm.backToActivity = backToActivity;
  vm.choosedUser = choosedUser;
  vm.seacrchForUser = seacrchForUser;
  vm.searchUser = searchUser;
  vm.newUser = newUser;
  vm.addNewUser = addNewUser;

  var activity = $state.params.activityDetail;
  vm.role = $localStorage.userInfo.data[0].Role;
  vm.participentDetailList = [];
  vm.newParticipantList = [];
  vm.activityEnrollTypes = ["Confirmed", "Tentative"];
  getEventRole();
/*vm.participant = {
Status: 'Tentative',
Role: 'Student'
}*/

vm.showSpinner = true;
vm.participantAdded = false
showDetailActivity(activity);

getParticipants();
if($localStorage.userInfo.data[0].Name != '' || $localStorage.userInfo.data[0].Name != null){
  $localStorage.userlogin = true;

}

function showDetailActivity(activity){
  vm.showSpinner = true;
  if(activity.Coordinator_url != null || activity.Coordinator_url == ""){
    userInfoService.getActivityCoordinatorDetail(activity.Coordinator_url).then(function(coordinatorDetails){
      vm.showSpinner = false;
      ActivityDetailStructure(activity,coordinatorDetails);
    },function(error){
      console.log('error',error);
    });
  }else{
    ActivityDetailStructureWithoutCoordinator(activity);
  }
}

function ActivityDetailStructure(activity,coordinatorDetails){
  var _activityDetail = {
    activity_type_id: activity.Activity_type,
    activity_address: activity.Address,
    activity_coordinator_url: activity.Coordinator_url,
    activity_email: activity.Email,
    activity_end_date: activity.End_date,
    activity_end_time: activity.End_time,
    activity_name: activity.Name,
    activity_phone: activity.Phone,
    activity_project_url: activity.Project_url,
    activity_recurrence: activity.Recurrence,
    activity_sb_Region: activity.SB_Region,
    activity_start_date: activity.Start_date,
    activity_start_time: activity.Start_time,
    activity_URL: activity.URL,
    activity__url: activity._url,
    coordinator_Address: coordinatorDetails.data.Address,
    coordinator_Email: coordinatorDetails.data.Email,
    coordinator_Name: coordinatorDetails.data.Name,
    coordinator_Phone: coordinatorDetails.data.Phone,
    coordinator_Profession: coordinatorDetails.data.Profession,
    coordinator_Role: coordinatorDetails.data.Role,
    coordinator_SB_Region: coordinatorDetails.data.SB_Region,
    coordinator_URL: coordinatorDetails.data.URL,
    coordinator__url: coordinatorDetails.data._url
  }
  vm.activityDetail = _activityDetail;
}
function ActivityDetailStructureWithoutCoordinator(activity){
  var _activityDetail = {
    activity_type_id: activity.Activity_type_id,
    activity_address: activity.Address,
    activity_coordinator_url: activity.Coordinator_url,
    activity_email: activity.Email,
    activity_end_date: activity.End_date,
    activity_end_time: activity.End_time,
    activity_name: activity.Name,
    activity_phone: activity.Phone,
    activity_project_url: activity.Project_url,
    activity_recurrence: activity.Recurrence,
    activity_sb_Region: activity.SB_Region,
    activity_start_date: activity.Start_date,
    activity_start_time: activity.Start_time,
    activity_URL: activity.URL,
    activity__url: activity._url,
    coordinator_Address: '',
    coordinator_Email: '',
    coordinator_Name: 'Not Set',
    coordinator_Phone: '',
    coordinator_Profession: '',
    coordinator_Role: '',
    coordinator_SB_Region: '',
    coordinator_URL: '',
    coordinator__url: ''
  }
  vm.activityDetail = _activityDetail;
}

function getParticipants(){
  vm.showSpinner = true;
  activityService.getActivityParticipants(activity._url).then(function(perticipants){
    vm.perticepantsList = perticipants;
    vm.showSpinner = false;
    angular.forEach(vm.perticepantsList.data, function (piece, index) {
      userInfoService.getUserByUrl(piece.Person_url).then(function(perticepantInfo){
        perticipantsStructure(perticepantInfo.data,piece);
      })

    })
  },function(error){
    console.log('error in getting perticipantsList',error)
  })
}

function perticipantsStructure(_perticepantInfo,_perticipantStatus){
  var perticipantsStructureObject = {
    participantStatus: _perticipantStatus,
    participantInfo: _perticepantInfo
  }
  vm.participentDetailList.push(perticipantsStructureObject);
}

function deleteUserFromActivity(activityDetail){
  userAuthenticationService.confirm('','Do You Want To Remove This Participant?','Yes','No',function(){
    vm.showSpinner = true;
    activityService.deletActivityFromUserList(activityDetail.participantStatus._url).then(function(data){
      userAuthenticationService.alertUser('Participant Deleted');
      vm.participentDetailList = [];

      getParticipants();
    },function(error){
      userAuthenticationService.alertUser('Error Occured');
      console.log("error in deleting userFrom activity",error);
    })
  },null)
}

function updateUserDetailFromActivity(perticipant){
  vm.showSpinner = true;
  activityService.updateActivity(perticipant.participantStatus,perticipant.participantStatus._url).then(function(data){
    userAuthenticationService.alertUser('Details Updated');
    vm.participentDetailList = [];
    getParticipants();
    $scope.modal.hide();
  },function(error){
    userAuthenticationService.alertUser('Error Occured');
    console.log(error);
  })
}

function showFormToUpdatePerticipantInActivity(perticipantInfo){
  vm.showSpinner = true;
  getEventRole();
  vm.userActivityDetailToEdit = perticipantInfo
  $ionicModal.fromTemplateUrl('editUserInActivity.html', {
    scope: $scope,
  }).then(function(modal) {
    $scope.modal = modal;
    vm.showSpinner = false;
    $scope.modal.show();

  });


}

function closeModel(){
  vm.participentDetailList = [];
  getParticipants();
  $scope.modal.hide();
}  

function getEventRole(){
  vm.showSpinner = true;
  activityService.getEventRole().then(function(userRole){
    vm.userRole = userRole.data;
    vm.showSpinner = false;
  },function(error){
    console.log(error);
  })
}

function showAddPerticipantForm(){
  var confirmPopup = $ionicPopup.confirm({
    title: 'Add Participant',
    templateUrl: '',
    buttons: [{
      text: 'Existing User',
      type: 'button-positive',
      onTap: function(){
        seacrchForUser();
      }

    }, {
      text: 'New User',
      type: 'button-positive',
      onTap: function(){
        newUser();
      }
    }, {
      text: 'Cancle ',
      type: 'button-positive',
      onTap: function(){
        vm.participentDetailList = [];
        getParticipants();
      }
    }]
  });
  $(".popup").addClass("width390");
}

function addParticipentToActivity(newParticipantDetail){
  if(newParticipantDetail.Name == undefined && newParticipantDetail.Email == undefined && newParticipantDetail.Phone == undefined){


  }else{
    vm.showSpinner = true;
    vm.participant = [];

    if(newParticipantDetail.Email){
      userAuthenticationService.emailauthentication(newParticipantDetail.Email).then(function(userData){
        if(userData.data.length > 0){
          addUserTOActivityList(newParticipantDetail,userData)
        }else{
          var newUserDetail = {
            Name: newParticipantDetail.Name,
            Email: newParticipantDetail.Email
          }
          userInfoService.addNewUser(newUserDetail).then(function(responsedata){
            userAuthenticationService.emailauthentication(responsedata.data.Email).then(function(userData){
              addUserTOActivityList(newParticipantDetail,userData)
            },function(error){
              console.log('Error in authentication',error);
            });


          },function(error){
            console.log('error in adding new user',error);
          })
        }

      },function(error){
        console.log("Wrong user",error)
      })
    }else{
      if(newParticipantDetail.Phone){
        userAuthenticationService.phoneauthentication(newParticipantDetail.Phone).then(function(userData){
          if(userData.data.length > 0){
            addUserTOActivityList(newParticipantDetail,userData)
          }else{
            var newUserInfo = {
              Name: newParticipantDetail.Name,
              Email: newParticipantDetail.Phone
            }
            userInfoService.addNewUser(newUserInfo).then(function(responsedata){
              userAuthenticationService.phoneauthentication(responsedata.data.Phone).then(function(userData){
                addUserTOActivityList(newParticipantDetail,userData)
              },function(error){
                console.log('Error in authentication',error);
              });


            },function(error){
              console.log('error in adding new user',error);
            })
          }

        })
      }
    }

  }

}

function addUserTOActivityList(newParticipantDetail,userData){
  vm.showSpinner = true;
  var newJoindActivity = [];
  if(newParticipantDetail.Status == "Confirmed"){
    newJoindActivity = {
      Activity_url: activity._url, 
      Person_url: userData.data[0]._url, 
      EventRole:  newParticipantDetail.Role,
      Status:'Confirmed',
      Last_active_date:new Date()
    }
  }else{
    newJoindActivity = {
      Activity_url: activity._url, 
      Person_url: userData.data[0]._url, 
      EventRole:  newParticipantDetail.Role,
      Status:'Tentative',
      Last_active_date:new Date()
    }
  }

  activityService.getPartcipantFromActivity(newJoindActivity.Activity_url,newJoindActivity.Person_url).then(function(res){
    if(res.data.length == 0) {
      activityService.joinActivity(newJoindActivity).then(function(resonseData){
        vm.showSpinner = false;
        userAuthenticationService.alertUser('Participant Added');
        $timeout(function () {   showAddPerticipantForm();}, 2001);
        newParticipantDetail = []
        $scope.modal.hide(); 
      },function(error){
        userAuthenticationService.alertUser('Error Occured');
        console.log(error);
        vm.showSpinner = false;
      })
    }else{
      newParticipantDetail = []
      $scope.modal.hide(); 
      userAuthenticationService.alertUser('User Already Enrolled In this Activity');
      $timeout(function () {   showAddPerticipantForm();}, 2001);

      vm.showSpinner = false;
    }
  },function(error){
    vm.showSpinner = false;
    console.log(error);
  })

}

function closeModelAndRefeshParticipant(){
  $scope.modal.hide();
  vm.participentDetailList = [];
  getParticipants();
}

function backToActivity(){
  $ionicHistory.nextViewOptions({
    disableBack: true
  });

  $state.go('app.organizer', {}, {reload: true});

}

function seacrchForUser(){
  $ionicModal.fromTemplateUrl('chooseUser.html', {
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
      $scope.entryLimit = 10; 
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

function choosedUser(choosedData){
  $scope.modal.hide();
  vm.participant ={
    Name: choosedData.Name,
    Email: choosedData.Email,
    Phone: choosedData.Phone,
    Status: 'Tentative',
    Role: 'Student'

  } 
  $ionicModal.fromTemplateUrl('perticipantDetailToActivity.html', {
    scope: $scope,
  }).then(function(modal) {
    $scope.modal = modal;
    vm.showSpinner = false;
    $scope.modal.show();
  });
}

function newUser(){
  vm.showSpinner = true;
  vm.NewUserData = {
    Role:'Student'
  }
  $ionicModal.fromTemplateUrl('newUsersForm.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.modal = modal;
    vm.showSpinner = false;
    $scope.modal.show();
  });
}

function addNewUser(userDetail){
  vm.showSpinner = true;
  vm.NewUserData = [];
  if(userDetail.Email){
    userAuthenticationService.emailauthentication(userDetail.Email).then(function(userData){
      if(userData.data.length > 0){
        vm.showSpinner = false;
        userAuthenticationService.alertUser('User Already Exist');
        $scope.modal.hide();
        choosedUser(userData.data[0]);
      }else{
        var newDetail = {
          Name: userDetail.Name,
          Email: userDetail.Email,
          Phone: userDetail.Phone,
          Role : userDetail.Role
        }

        userInfoService.addNewUser(newDetail).then(function(newEnrolledUser){
          vm.showSpinner = false;
          choosedUser(newEnrolledUser.data);
        },function(error){
          console.log('error');
        });
      }

    })
  }else{
    if(userDetail.Phone){
      vm.showSpinner = false;
      userAuthenticationService.phoneauthentication(userDetail.Phone).then(function(userData){
        if(userData.data.length > 0){
          vm.showSpinner = false;
          userAuthenticationService.alertUser('User Already Exist');
          $scope.modal.hide();
          choosedUser(userData.data[0]);
        }else{
          var newDetail = {
            Name: userDetail.Name,
            Email: userDetail.Email,
            Phone: userDetail.Phone,
            Role : userDetail.Role
          }
          userInfoService.addNewUser(newDetail).then(function(newEnrolledUser){
            vm.showSpinner = false;
            choosedUser(newEnrolledUser.data);
          },function(error){
            console.log('error');
          });
        }
      })
    }
  }
}
}

















































































angular
.module('starter')
.controller('addActivityController', addActivityController);

addActivityController.$inject = ['$scope', '$stateParams', '$state', 'userInfoService','$ionicModal','userAuthenticationService','activityService', '$localStorage','$ionicHistory','projectService', 'filterFilter','$ionicPopup','postalCodeService','$timeout','setLocationService','$filter'];

function addActivityController($scope, $stateParams, $state, userInfoService, $ionicModal, userAuthenticationService, activityService, $localStorage, $ionicHistory,projectService, filterFilter,$ionicPopup,postalCodeService,$timeout,setLocationService,$filter) {
  var vm = this;

  vm.closeModel = closeModel;
  vm.addNewActivityDetail = addNewActivityDetail;
  vm.seacrchForCoordinator = seacrchForCoordinator;
  vm.searchUser = searchUser;
  vm.choosedCoordinator =  choosedCoordinator;
  vm.closeThisModel = closeThisModel;
  vm.autoFillAddressDetail = autoFillAddressDetail;
  vm.levelChangeEvent = levelChangeEvent;

  $scope.checked_days = [];

  vm.newActivity = {
    Activity_type : 'varga',
    Recurrence : 'daily',
    Address : {
      Postal_code: '',
      Country: ''
    }

  }

  activityList();
  recurrenceList();
  daysList();
  getCountry();
  projectList();

 if($localStorage.sbRegionPath){
          getRegionsByurl($localStorage.sbRegionPath);

    }

  vm.showSpinner = true;


  function closeModel(){
    $ionicHistory.nextViewOptions({
      disableBack: true
    });
    $state.go('app.organizer');

  } 
  function addNewActivityDetail(newActivity){
    newActivity.Days = $scope.checked_days
    newActivity.Region_url = vm.reginPathSelected;
    activityService.addNewActivity(newActivity).then(function(detail){
      console.log("detail",detail);
      userAuthenticationService.alertUser('Activity Added Successfully');

      vm.showSpinner = false;
      $ionicHistory.nextViewOptions({
        disableBack: true
      });
      $state.go('app.activityDetail',{'activityDetail':detail.data},{location: false, inherit: false});

    },function(error){
      userAuthenticationService.alertUser('Error Occured');
      console.log('Error in adding activity',error);
    })
  }

  function recurrenceList(){
    vm.showSpinner = true;
    activityService.getRecurrence().then(function(recurrence){
      vm.recurrenceList = recurrence;
      vm.showSpinner = false;
    })
  }

  function activityList(){
    vm.showSpinner = true;
    userInfoService.getAllActivity().then(function(activity){
      vm.activityList= activity.data;
      vm.showSpinner = false;
    })
  }

  function daysList(){
    vm.showSpinner = true;
    activityService.getAllDays().then(function(daysList){
      vm.daysList= daysList.data;
      vm.showSpinner = false;
    })
  }

  function getCountry(){
    vm.showSpinner = true;
    userInfoService.getAllCountryList().then(function(countrty){
      vm.countrList = countrty;
      vm.showSpinner = false;
    },function(error){
      console.log(error);
    })
  } 

  function projectList(){
    projectService.getAllProject().then(function(project){
      vm.projectList = project.data;
    })
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
          userAuthenticationService.alertUser('No Mathches');
          vm.showSpinner = false;
        }

      },function(error){
        console.log("Error in updating FacebookID")
      })
    }
  }

  function choosedCoordinator(choosedData){
    $scope.modal.hide();
    vm.newActivity.Coordinator_url = choosedData._url;
    vm.activityCo_ordinatorName = choosedData.Name;
  }

  function closeThisModel(){
    $scope.modal.hide();
  }


  function autoFillAddressDetail(){
    if(vm.newActivity.Address.Country){
      if(vm.newActivity.Address.Postal_code){
        vm.showSpinner = true;
        postalCodeService.getDetailsByPostalCode(vm.newActivity.Address.Country,vm.newActivity.Address.Postal_code).then(function(addressDetails){
          if(addressDetails.data.length>0){
            vm.newActivity.Address = {
              District : addressDetails.data[0].Address.District,
              Locality : addressDetails.data[0].Address.Locality,
              State : addressDetails.data[0].Address.State,
              City : addressDetails.data[0].Address.City,
              Country : addressDetails.data[0].Address.Country,
              Postal_code : addressDetails.data[0].Address.Postal_code
            }
            userAuthenticationService.alertUser('Address Autofilled');
          }else{
            userAuthenticationService.alertUser('Address Not Found');
          }

          vm.showSpinner = false;
        },function(error){
          console.log(error);
        })
      }else{
        userAuthenticationService.alertUser('Please Enter Postal_code');
      }

    }else{
      userAuthenticationService.alertUser('Please Enter Country');
    }


  }

  function levelChangeEvent(){
        console.log("levelChangeEvent");
        console.log("selectedData",vm.newActivity.Region_url);
        getRegionsByurl(vm.newActivity.Region_url);
    }

    function getRegionsByurl(region_url){
        if(region_url){
            vm.reginPathSelected = region_url;
            setLocationService.getRegionsByurl(region_url).then(function(reginUrlServiceRes){
                var listData = [];
            
                vm.newActivity.Region_url = reginUrlServiceRes.data.path;
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