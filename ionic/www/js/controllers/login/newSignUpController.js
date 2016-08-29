angular
.module('starter')
.controller('newSignUpController', newSignUpController);

newSignUpController.$inject = ['$scope', '$stateParams', '$state', 'userAuthenticationService', '$ionicModal', 'userInfoService', 'userAuthenticationService', '$localStorage','$rootScope','$ionicHistory'];

function newSignUpController($scope, $stateParams, $state, userAuthenticationService, $ionicModal, userInfoService, userAuthenticationService, $localStorage,$rootScope,$ionicHistory) {
	var vm = this;

	vm.addUser = addUser;
	vm.closeModel =  closeModel;
	vm.geolocate = geolocate;
	vm.updateUser = updateUser;

	vm.showUpdateButtn = false;
	var placeSearch, autocomplete;
	vm.userAddress = [];

	console.log('$rootScope.fbResponse',  $rootScope.fbResponse);
	console.log(' $rootScope.email',   $rootScope.email);
	console.log('$rootScope.googleInfo',  $rootScope.googleInfo);
	console.log('$localStorage.update',$localStorage.update);

		if($rootScope.fbResponse){
			$rootScope.fbResponse
			vm.newUser = {
				Name: $rootScope.fbResponse.name
			}
		}
		if($rootScope.email){
			vm.newUser = {
				Name: $rootScope.email
			}
		}
		if($rootScope.googleInfo){
			console.log("email signup")
			vm.newUser = {
				Name: $rootScope.googleInfo.name,
				Email:  $rootScope.googleInfo.email
			}
			console.log("vm.newUser",vm.newUser);
		}


	if($localStorage.update){
		console.log('if');
		vm.showUpdateButtn = true;
		userAuthenticationService.emailauthentication($localStorage.update.email).then(function(userData){
               console.log('userData',userData);
				vm.newUser = userData.data[0];
		},function(error){
			console.log(error)
		})
	}else{

	}
 $scope.$on('$ionicView.beforeEnter', function () {
 	userProfession();
 })
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
		console.log('place',place);
		for (var component in componentForm) {
			document.getElementById(component).value = '';
			document.getElementById(component).disabled = false;
		}

		for (var i = 0; i < place.address_components.length; i++) {
			var addressType = place.address_components[i].types[0];
			console.log('component',place.address_components[i]);
			console.log('addressType',addressType);
			if (componentForm[addressType]) {				
				var val = place.address_components[i].long_name;
				console.log('val',val);
				document.getElementById(addressType).value = val;
			}
		}
	}


	function closeModel(){
		 $ionicHistory.nextViewOptions({
            disableBack: true
          });
		$state.go('app.main');
	} 

	function userProfession(){
		userAuthenticationService.getProfession().then(function(userProfession){
            console.log('getProfession',userProfession)
            vm.userProfessionList = userProfession;
        },function(error){
             console.log(error);
        })
	} 

	function addUser(newUserDetail){
		
          console.log(document.getElementById('country').value);
          newUserDetail.Address = {'Country': document.getElementById('country').value,
          							'Postal_code': document.getElementById('postal_code').value,
          							'City': document.getElementById('locality').value,
          							'State': document.getElementById('administrative_area_level_1').value,
          							'Country': document.getElementById('country').value,
          							'Address_line1': document.getElementById('street_number').value,
          							'Address_line2': document.getElementById('route').value,
      							}
				if($rootScope.fbResponse){
					newUserDetail.Facebook_id = $rootScope.fbResponse.id;
				}
      			newUserDetail.Role = "Student";
          userInfoService.addNewUser(newUserDetail).then(function(responsedata){
               

                userAuthenticationService.emailauthentication(responsedata.data.Email).then(function(userData){
            		$localStorage.userInfo = [];
            		$rootScope.fbResponse = [];
					$rootScope.email = [];
					$rootScope.googleInfo = [];
					$localStorage.update = [];
           			$localStorage.userInfo = userData;
               
           			  $ionicHistory.nextViewOptions({
                        disableBack: true
                      });
               			$state.go('app.student');
	          },function(error){
	               console.log(error);
	          });


          },function(error){
               console.log('error');
          })

     } 

     function updateUser(newUserDetail){
     	console.log(newUserDetail);
     	 userInfoService.updateUserDetail(newUserDetail).then(function(userUpdateddata){
            console.log('updatedataresult',userUpdateddata);

            	userAuthenticationService.emailauthentication(userUpdateddata.data.Email).then(function(userData){
            		$localStorage.userInfo = [];
            		$rootScope.fbResponse = [];
					$rootScope.email = [];
					$rootScope.googleInfo = [];
					$localStorage.update = [];
           			$localStorage.userInfo = data;
               
           			$ionicHistory.nextViewOptions({
                    	disableBack: true
                    });
           			if(userData.data[0].Role == 'Student'){
		             	$state.go('app.student');
		            }else{
		                $state.go('app.organizer');
		            }
	          },function(error){
	               console.log(error);
	          });




           
            
         },function(error){
            console.log(error);
         });
     }
}