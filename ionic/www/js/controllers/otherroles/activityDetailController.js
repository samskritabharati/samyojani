angular
    .module('starter')
    .controller('activityDetailController', activityDetailController);

  	activityDetailController.$inject = ['$scope', '$stateParams', '$state', '$rootScope','userInfoService','$ionicModal','userAuthenticationService'];

  	function activityDetailController($scope, $stateParams, $state, $rootScope,userInfoService, $ionicModal, userAuthenticationService) {
    	var vm = this;
    	var activity = $state.params.activityDetail;

    	vm.userName = $rootScope.userDetail.data[0].Name;

    	showDetailActivity(activity);

    	function showDetailActivity(activity){
    		userInfoService.getActivityProjectDetail(activity.Project_url).then(function(projectDetails){
                console.log('projectDetails',projectDetails);
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
	         console.log('detail activity',vm.activityDetail);
   		 }

	}

	angular
    .module('starter')
    .controller('addActivityController', addActivityController);

  	addActivityController.$inject = ['$scope', '$stateParams', '$state', '$rootScope','userInfoService','$ionicModal','userAuthenticationService','activityService'];

  	function addActivityController($scope, $stateParams, $state, $rootScope,userInfoService, $ionicModal, userAuthenticationService, activityService) {
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
		newActivity.Coordinator_url = $rootScope.userDetail.data[0]._url;
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