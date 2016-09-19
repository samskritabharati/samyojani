angular
.module('starter')
.controller('activityMapViewController', activityMapViewController);

activityMapViewController.$inject = ['$scope', '$state', '$localStorage', 'userInfoService' ,'$ionicHistory','$compile'];

function activityMapViewController($scope, $state, $localStorage,userInfoService,$ionicHistory,$compile) {
	var vm = this;

	vm.routingListView = routingListView;

	if($localStorage.userInfo.data[0].Name != '' || $localStorage.userInfo.data[0].Name != null){
		$localStorage.userlogin = true;
	}

	 var activity = $state.params.activitys;
	 var type = $state.params.type;
	 console.log("dgfhhjh",type);

	var locations = [];

	/*userInfoService.getUserActivities($localStorage.userInfo.data[0].SB_Region).then(function(activityData){
		vm.activityData = activityData.data;*/
		/*console.log("ttttttttttttttttt",activityData);*/
		angular.forEach(activity, function (key, index) {
			key.Address.Address_line1
			var address = [];
			address.details = [];

			address.push(key.Address.Address_line1);
			if(key.Address.Address_line2)address.push(key.Address.Address_line2);
			if(key.Address.Locality)address.push(key.Address.Locality);
			if(key.Address.District)address.push(key.Address.District);
			if(key.Address.City)address.push(key.Address.City);
			if(key.Address.State)address.push(key.Address.State);
			if(key.Address.Country)address.push(key.Address.Country);
			if(key.Address.Postal_code)address.push(key.Address.Postal_code);
			address.details.push(key);
			locations.push(address); 
		})

		initialize();

	/*},function(error){
		console.log(error);
	}).finally(function () {
		vm.showSpinner = false;
	});*/



	function initialize() {
		console.log("inz")
		var map = new google.maps.Map(document.getElementById('map'), {
			zoom: 8,
			center: {lat: -34.397, lng: 150.644}
		});
				var geocoder = new google.maps.Geocoder();

		/*$scope.cities = [
		{ title: 'Sydney', lat: -33.873033, lng: 151.231397 },
		{ title: 'Melbourne', lat: -37.812228, lng: 144.968355 }
		];*/


		$scope.infowindow = new google.maps.InfoWindow({
			content: ''
		});

		angular.forEach(locations, function (key, index) {
			console.log(locations[index][1]+' '+locations[index][2]+' '+locations[index][3]+' '+locations[index][4]);
			var completeAddress = locations[index][1]+' '+locations[index][2]+' '+locations[index][3]+' '+locations[index][4];
			geocoder.geocode( { 'address': completeAddress}, function(results, status) {


				if (status == google.maps.GeocoderStatus.OK) {
var latitude = results[0].geometry.location.lat();
var longitude = results[0].geometry.location.lng();
console.log(latitude);
console.log(longitude);

					map.setCenter(results[0].geometry.location);
					var latlang = results[0].geometry.location;
					console.log("latlang",latlang);
					var marker = new google.maps.Marker({
						position: new google.maps.LatLng(latitude,longitude),
						map: map,

					});
					console.log("ths ssss",locations[index]);
					if( type == 'userInfo'){
						var content = '<a class="btn btn-default">'+locations[index].details[0].Name+'</br>'+locations[index].details[0].Phone+'</br>'+locations[index].details[0].Address.Address_line1+','+locations[index].details[0].Address.Address_line1+','+locations[index].details[0].Address.Address_line2+','+locations[index].details[0].Address.City+','+locations[index].details[0].Address.State+','+locations[index].details[0].Address.Country+'</a>';

					}else{
						var content = '<a ng-click="cityDetail('+ index +')" class="btn btn-default">'+locations[index].details[0].Name+'</br>'+locations[index].details[0].Address.Address_line1+','+locations[index].details[0].Address.Address_line1+','+locations[index].details[0].Address.Address_line2+','+locations[index].details[0].Address.City+','+locations[index].details[0].Address.State+','+locations[index].details[0].Address.Country+'</a>';

					}
					var compiledContent = $compile(content)($scope)
					google.maps.event.addListener(marker, 'click', (function(marker, content, scope) {
						google.maps.event.trigger(map, 'resize');
						return function() {
							scope.infowindow.setContent(content);
							scope.infowindow.open(scope.map, marker);
						};

					})(marker, compiledContent[0], $scope));
				}
			})


		})

	}

	$scope.cityDetail = function(deta) {
		$ionicHistory.nextViewOptions({
			disableBack: true
		});
		$state.go('app.activityDetail',{'activityDetail':locations[deta].details[0]},{location: false, inherit: false});
	}

	function routingListView(){
		$ionicHistory.nextViewOptions({
			disableBack: true
		});
		if($localStorage.userInfo.data[0].Role == 'Student'){
			$state.go('app.student');
		}else{
			$state.go('app.organizer', {}, {reload: true});
		}
	}

}
