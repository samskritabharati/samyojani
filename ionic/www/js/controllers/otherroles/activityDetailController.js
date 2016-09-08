angular
    .module('starter')
    .controller('activityDetailController', activityDetailController);

  	activityDetailController.$inject = ['$scope', '$stateParams', '$state', 'userInfoService','$ionicModal','userAuthenticationService', '$localStorage', 'activityService','$timeout','$ionicHistory'];

  	function activityDetailController($scope, $stateParams, $state ,userInfoService, $ionicModal, userAuthenticationService, $localStorage, activityService,$timeout ,$ionicHistory) {
    	var vm = this;
    	vm.deleteUserFromActivity = deleteUserFromActivity;
    	vm.updateUserDetailFromActivity = updateUserDetailFromActivity;
    	vm.showFormToUpdatePerticipantInActivity = showFormToUpdatePerticipantInActivity;
    	vm.closeModel = closeModel;
    	vm.showAddPerticipantForm = showAddPerticipantForm;
    	vm.addParticipentToActivity = addParticipentToActivity;
    	vm.closeModelAndRefeshParticipant = closeModelAndRefeshParticipant;
      vm.backToActivity = backToActivity;
         
    	var activity = $state.params.activityDetail;
    	vm.userName = $localStorage.userInfo.data[0].Name;
    	vm.role = $localStorage.userInfo.data[0].Role;
    	vm.participentDetailList = [];
    	vm.newParticipantList = [];
    	vm.activityEnrollTypes = ["Confirmed", "Tentative"];
      vm.participant = {
        Status: 'Tentative',
        Role: 'Student'
      }
      console.log('vm.role ',vm.role );

      vm.showSpinner = false;
      vm.participantAdded = false
    	showDetailActivity(activity);

    	getParticipants();
    	if($localStorage.userInfo.data[0].Name != '' || $localStorage.userInfo.data[0].Name != null){
         	$localStorage.userlogin = true;

    	}

    	function showDetailActivity(activity){
    /*    console.log("projrct urlllllllllllllll",activity.Project_url);*/
    	/*	userInfoService.getActivityProjectDetail(activity.Project_url).then(function(projectDetails){*/
          /*console.log("project",projectDetails);*/
                if(activity.Coordinator_url != null || activity.Coordinator_url == ""){
                    userInfoService.getActivityCoordinatorDetail(activity.Coordinator_url).then(function(coordinatorDetails){
                       /* ActivityDetailStructure(activity,coordinatorDetails,projectDetails);*/
                          ActivityDetailStructure(activity,coordinatorDetails);
                    },function(error){
                        console.log('error',error);
                    });
                }else{
                   /*  ActivityDetailStructure(activity,'',projectDetails);*/
                   ActivityDetailStructureWithoutCoordinator(activity);
                }
               
           /* },function(error){
                console.log('error',error);
            })*/

    	}
    	 
    	function ActivityDetailStructure(activity,coordinatorDetails){
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

   			activityService.getActivityParticipants(activity._url).then(function(perticipants){
   				vm.perticepantsList = perticipants;
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
   			activityService.deletActivityFromUserList(activityDetail.participantStatus._url).then(function(data){
   				vm.participentDetailList = [];
   				getParticipants();
   			},function(error){
   				console.log("error in deleting userFrom activity",error);
   			})
   		}

   		function updateUserDetailFromActivity(perticipant){
   			activityService.updateActivity(perticipant.participantStatus,perticipant.participantStatus._url).then(function(data){
               vm.participentDetailList = [];
   				getParticipants();
   				$scope.modal.hide();
            },function(error){
                console.log(error);
            })
   		}

   		function showFormToUpdatePerticipantInActivity(perticipantInfo){
   			getEventRole();
   			vm.userActivityDetailToEdit = perticipantInfo
        console.log("vm.userActivityDetailToEdit",vm.userActivityDetailToEdit);
   			$ionicModal.fromTemplateUrl('editUserInActivity.html', {
           scope: $scope,
          }).then(function(modal) {
            $scope.modal = modal;
            $scope.modal.show();
           
          });
              
          $scope.closeModal = function() {
            $scope.modal.hide();
          };
   		}

   		function closeModel(){

          $scope.modal.hide();
        }  

        function getEventRole(){
	        activityService.getEventRole().then(function(userRole){
	            vm.userRole = userRole.data;
	        },function(error){
	             console.log(error);
	        })
    	}

    	function showAddPerticipantForm(){
        getEventRole();
    		$ionicModal.fromTemplateUrl('addPerticipantToActivity.html', {
           scope: $scope,
          }).then(function(modal) {
            $scope.modal = modal;
            $scope.modal.show();
           
          });
    	}

    	function addParticipentToActivity(newParticipantDetail){
        vm.showSpinner = true;
    		vm.participant = [];
        vm.participant = {
          Status: 'Tentative',
          Role: 'Student'
        }       

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
    	}

      function addUserTOActivityList(newParticipantDetail,userData){
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
            activityService.joinActivity(newJoindActivity).then(function(data){
                 vm.showSpinner = false;
                 vm.participantAdded = true;
                 $timeout(function () { vm.participantAdded = false; }, 1000); 
              /* userAuthenticationService.alertUser('','','Participant added',null)*/
               newParticipantDetail = []
            },function(error){
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
	}

	angular
    .module('starter')
    .controller('addActivityController', addActivityController);

  	addActivityController.$inject = ['$scope', '$stateParams', '$state', 'userInfoService','$ionicModal','userAuthenticationService','activityService', '$localStorage','$ionicHistory'];

  	function addActivityController($scope, $stateParams, $state, userInfoService, $ionicModal, userAuthenticationService, activityService, $localStorage, $ionicHistory) {
      var vm = this;

    	vm.closeModel = closeModel;
    	vm.addNewActivityDetail = addNewActivityDetail;
   

      vm.newActivity = {
        Activity_type_id : 'varga',
        Recurrence : 'daily'
      }
    	activityList();
    	recurrenceList();
      daysList();
      getCountry();

 
 

	function closeModel(){
     $ionicHistory.nextViewOptions({
        disableBack: true
      });
     $state.go('app.organizer');
		 
	} 

	/*$scope.$watch(function() { return vm.newActivity.Start_time },
      function() {
      	vm.newActivity.End_time = vm.newActivity.Start_time;
      }
 	);*/

	function addNewActivityDetail(newActivity){
		newActivity.Coordinator_url = $localStorage.userInfo.data[0]._url;
    console.log("newActivity",newActivity);
		/*newActivity.Address = {'Country': document.getElementById('country').value,
          							'Postal_code': document.getElementById('postal_code').value,
          							'City': document.getElementById('locality').value,
          							'State': document.getElementById('administrative_area_level_1').value,
          							'Country': document.getElementById('country').value,
          							'Address_line1': document.getElementById('street_number').value,
          							'Address_line2': document.getElementById('route').value,
      							}*/
		activityService.addNewActivity(newActivity).then(function( detail){
      $ionicHistory.nextViewOptions({
        disableBack: true
      });
     /*$state.go('app.organizer');*/
     $state.go('app.activityDetail',{'activityDetail':detail.data},{location: false, inherit: false});
     
		},function(error){
			console.log('Error in adding activity',error);
		})
	}

	function recurrenceList(){
		activityService.getRecurrence().then(function(recurrence){
			vm.recurrenceList = recurrence
		})
	}

	function activityList(){
		userInfoService.getAllActivity().then(function(activity){
            vm.activityList= activity.data;
        })
	}

  function daysList(){
    activityService.getAllDays().then(function(daysList){
            vm.daysList= daysList.data;
        })
  }

  function getCountry(){
    userInfoService.getAllCountryList().then(function(countrty){
            vm.countrList = countrty;
        },function(error){
             console.log(error);
        })
  } 
/*$scope.selection = [];
   $scope.toggleSelection = function toggleSelection(fruitName) {
      console.log("fruitName",fruitName);
      var idx = $scope.selection.indexOf(fruitName);
    
      // is currently selected
      if (idx > -1) {
        $scope.selection.splice(idx, 1);
      }
      
      // is newly selected
      else {
        $scope.selection.push(fruitName);
      }

      console.log(' $scope.selection', $scope.selection);
    };*/
  
}