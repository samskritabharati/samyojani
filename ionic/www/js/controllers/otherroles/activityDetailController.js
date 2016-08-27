angular
    .module('starter')
    .controller('activityDetailController', activityDetailController);

  	activityDetailController.$inject = ['$scope', '$stateParams', '$state', 'userInfoService','$ionicModal','userAuthenticationService', '$localStorage', 'activityService'];

  	function activityDetailController($scope, $stateParams, $state ,userInfoService, $ionicModal, userAuthenticationService, $localStorage, activityService ) {
    	var vm = this;
    	vm.deleteUserFromActivity = deleteUserFromActivity;
    	vm.updateUserDetailFromActivity = updateUserDetailFromActivity;
    	vm.showFormToUpdatePerticipantInActivity = showFormToUpdatePerticipantInActivity;
    	vm.closeModel = closeModel;
    	vm.showAddPerticipantForm = showAddPerticipantForm;
    	vm.addParticipentToActivity = addParticipentToActivity;
    	vm.closeModelAndRefeshParticipant = closeModelAndRefeshParticipant;
         
    	var activity = $state.params.activityDetail;
    	vm.userName = $localStorage.userInfo.data[0].Name;
    	vm.role = $localStorage.userInfo.data[0].Role;
    	console.log("vm.role",vm.role);
    	vm.participentDetailList = [];
    	vm.newParticipantList = [];
    	vm.activityEnrollTypes = ["Confirmed", "Tentative"];
    	showDetailActivity(activity);

    	getParticipants();
    	if($localStorage.userInfo.data[0].Name != '' || $localStorage.userInfo.data[0].Name != null){
         	$localStorage.userlogin = true;

    	}

    	function showDetailActivity(activity){
    		userInfoService.getActivityProjectDetail(activity.Project_url).then(function(projectDetails){
                if(activity.Coordinator_url != null || activity.Coordinator_url == ""){
                    userInfoService.getActivityCoordinatorDetail(activity.Coordinator_url).then(function(coordinatorDetails){
                        console.log(coordinatorDetails);
                        ActivityDetailStructure(activity,coordinatorDetails,projectDetails);
                    },function(error){
                        console.log('error',error);
                    });
                }else{
                     ActivityDetailStructure(activity,'',projectDetails);
                }
               
            },function(error){
                console.log('error',error);
            })

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

   		function getParticipants(){
   			console.log("userUrl",activity._url);
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
   			console.log('_perticepantInfo',_perticepantInfo);
   			console.log('_perticipantStatus',_perticipantStatus);
   			var perticipantsStructureObject = {
   				perticipantStaus: _perticipantStatus,
   				perticepantInfo: _perticepantInfo
   			}
   			console.log('perticipantsStructureObject',perticipantsStructureObject);
   			vm.participentDetailList.push(perticipantsStructureObject);
   			console.log('vm.participentDetailList',vm.participentDetailList);
   		}

   		function deleteUserFromActivity(activityDetail){
   			activityService.deletActivityFromUserList(activityDetail.perticipantStaus._url).then(function(data){
   				vm.participentDetailList = [];
   				getParticipants();
   			},function(error){
   				console.log("error in deleting userFrom activity",error);
   			})
   		}

   		function updateUserDetailFromActivity(perticipant){
   			activityService.updateActivity(perticipant.perticipantStaus,perticipant.perticipantStaus._url).then(function(data){
                console.log('activity joined scc',data);
               vm.participentDetailList = [];
   				getParticipants();
   				$scope.modal.hide();
            },function(error){
                console.log(error);
            })
   		}

   		function showFormToUpdatePerticipantInActivity(perticipantInfo){
   			userRole();
   			vm.userActivityDetailToEdit = perticipantInfo
   			$ionicModal.fromTemplateUrl('editUserInActivity.html', {
           scope: $scope,
           animation: 'slide-in-right'
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

        function userRole(){
	        userInfoService.getUserRole().then(function(userRole){
	            vm.userRole = userRole.data;
	            console.log("role", vm.userRole);
	        },function(error){
	             console.log(error);
	        })
    	}

    	function showAddPerticipantForm(){
    		$ionicModal.fromTemplateUrl('addPerticipantToActivity.html', {
           scope: $scope,
           animation: 'slide-in-right'
          }).then(function(modal) {
            $scope.modal = modal;
            $scope.modal.show();
           
          });
    	}

    	function addParticipentToActivity(newParticipantDetail){
    		vm.participitant = [];
//wt s the condition if email not available
		  /*	vm.newParticipantList.push(newParticipantDetail);*/
		  	userAuthenticationService.emailauthentication(newParticipantDetail.Email).then(function(userData){
			  	if(newParticipantDetail.Status == "Confirmed"){
		            var newJoindActivity = {
		                Activity_url: activity._url, 
		                Person_url: userData.data[0]._url, 
		              /*  Role:  newParticipantDetail.Role,*/
		              Role:  "Student",
		                Status:'Confirmed',
		                Last_active_date:new Date()
		            }
		        }else{
		            var newJoindActivity = {
		                Activity_url: activity._url, 
		                Person_url: userData.data[0]._url, 
		                /*Role:  newParticipantDetail.Role,*/
		                Role:  "Student",
		                Status:'Tentative',
		                Last_active_date:new Date()
		            }
		        }
		        
		        activityService.joinActivity(newJoindActivity).then(function(data){
		           console.log("participant added")
		           newParticipantDetail = []
		        },function(error){
		            console.log(error);
		        })
		  },function(error){
		  		console.log(error)
		  })
    	}

	    function closeModelAndRefeshParticipant(){
	    	 $scope.modal.hide();
	    	 getParticipants();
	    }
	}

	angular
    .module('starter')
    .controller('addActivityController', addActivityController);

  	addActivityController.$inject = ['$scope', '$stateParams', '$state', 'userInfoService','$ionicModal','userAuthenticationService','activityService', '$localStorage'];

  	function addActivityController($scope, $stateParams, $state, userInfoService, $ionicModal, userAuthenticationService, activityService, $localStorage) {
    	var vm = this;

    	vm.closeModel = closeModel;
    	vm.geolocate = geolocate;
    	vm.addNewActivityDetail = addNewActivityDetail;
    /*	vm.newActivity.Start_time = 00;*/

    	activityList();
    	recurrenceList();

    	function geolocate(){
		if (navigator.geolocation) {
			navigator.geolocation.getCurrentPosition(function(position) {
				var geolocation = {
					lat: position.coords.latitude,
					lng: position.coords.longitude
				};
				console.log(geolocation);
				var circle = new google.maps.Circle({
					center: geolocation,
					radius: position.coords.accuracy
				});
				autocomplete.setBounds(circle.getBounds());
			});
		}
	}
	initAutocomplete();

	var componentForm = {
		street_number: 'short_name',
		route: 'long_name',
		locality: 'long_name',
		administrative_area_level_1: 'short_name',
		country: 'long_name',
		postal_code: 'short_name'
	};

	google.maps.event.addDomListener(document.getElementById('autocomplete'), 'focus', geolocate); 

	function initAutocomplete() {
		autocomplete = new google.maps.places.Autocomplete(
			(document.getElementById('autocomplete')),
			{types: ['geocode']});

		autocomplete.addListener('place_changed', fillInAddress);
	}

	function fillInAddress() {
		var place = autocomplete.getPlace();

		for (var component in componentForm) {
			document.getElementById(component).value = '';
			document.getElementById(component).disabled = false;
		}

		for (var i = 0; i < place.address_components.length; i++) {
			var addressType = place.address_components[i].types[0];
			if (componentForm[addressType]) {
				var val = place.address_components[i][componentForm[addressType]];
				document.getElementById(addressType).value = val;
			}
		}
	}


	function closeModel(){
		$state.go('app.main');
	} 

	/*$scope.$watch(function() { return vm.newActivity.Start_time },
      function() {
      	vm.newActivity.End_time = vm.newActivity.Start_time;
      }
 	);*/

	function addNewActivityDetail(newActivity){
		console.log('activitynew',newActivity);
		newActivity.Coordinator_url = $localStorage.userInfo.data[0]._url;
		newActivity.Address = {'Country': document.getElementById('country').value,
          							'Postal_code': document.getElementById('postal_code').value,
          							'City': document.getElementById('locality').value,
          							'State': document.getElementById('administrative_area_level_1').value,
          							'Country': document.getElementById('country').value,
          							'Address_line1': document.getElementById('street_number').value,
          							'Address_line2': document.getElementById('route').value,
      							}
		activityService.addNewActivity(newActivity).then(function(data){
			console.log('activity added',data);
		},function(error){
			console.log('Error in adding activity',error);
		})
	}

	function recurrenceList(){
		activityService.getRecurrence().then(function(recurrence){
			console.log('recrr',recurrence);
			vm.recurrenceList = recurrence
		})
	}

	function activityList(){
		userInfoService.getAllActivity().then(function(activity){
            vm.activityList= activity.data;
        })
	}
}