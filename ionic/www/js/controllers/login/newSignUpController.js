angular
.module('starter')
.controller('newSignUpController', newSignUpController);

newSignUpController.$inject = ['$scope', '$stateParams', '$state', 'userAuthenticationService', '$ionicModal', 'userInfoService'];

function newSignUpController($scope, $stateParams, $state, userAuthenticationService, $ionicModal, userInfoService) {
	var vm = this;

	vm.addUser = addUser;
	vm.closeModel =  closeModel;
	vm.geolocate = geolocate;

	var placeSearch, autocomplete;
	vm.userAddress = [];


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
			if (componentForm[addressType]) {				
				var val = place.address_components[i].long_name;
				document.getElementById(addressType).value = val;
			}
		}
	}


	function closeModel(){
		console.log("hr");
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

      	
          console.log(newUserDetail);
          userInfoService.addNewUser(newUserDetail).then(function(data){
               console.log(data);
          },function(error){
               console.log('error');
          })

     } 
}