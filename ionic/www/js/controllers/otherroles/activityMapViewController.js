angular
.module('starter')
.controller('activityMapViewController', activityMapViewController);

activityMapViewController.$inject = ['$scope', '$state', '$localStorage', 'userInfoService' ,'$ionicHistory','$compile','filterFilter','$filter'];

function activityMapViewController($scope, $state, $localStorage,userInfoService,$ionicHistory,$compile,filterFilter,$filter) {
	var vm = this;

	vm.routingListView = routingListView;

	if($localStorage.userInfo.data[0].Name != '' || $localStorage.userInfo.data[0].Name != null){
		$localStorage.userlogin = true;
	}

	var activity = $state.params.activitys;
	vm.activitys = activity
	$scope.currentPage = 1;
	$scope.totalItems = vm.activitys.length;
	$scope.entryLimit = 5; 
	$scope.noOfPages = Math.ceil($scope.totalItems / $scope.entryLimit);

	$scope.$watch('search', function (newVal, oldVal) {
		$scope.filtered = filterFilter(vm.activitys, newVal);
		$scope.totalItems = $scope.filtered.length;
		$scope.noOfPages = Math.ceil($scope.totalItems / $scope.entryLimit);
		$scope.currentPage = 1;
		vm.showSpinner = false;
	}, true);
	var type = $state.params.type;
	var locations = [];
	$scope.$watch(function() { return  vm.showingPage },
		function() {     
		console.log("showingPage",vm.showingPage) 
			var dataShowCount =(vm.showingPage-1)*$scope.entryLimit;
			var res = $filter('startFrom')(vm.activitys, dataShowCount);
			var res2 = $filter('limitTo')(res, '5');
			locations = [];
			angular.forEach(res2, function (key, index) {
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
		})

	function initialize() {
		var map = new google.maps.Map(document.getElementById('map'), {
			zoom: 8,
			center: {lat: -34.397, lng: 150.644}
		});
		var geocoder = new google.maps.Geocoder();


		$scope.infowindow = new google.maps.InfoWindow({
			content: ''
		});
		angular.forEach(locations, function (key, index) {

			var completeAddress = locations[index][1]+' '+locations[index][2]+' '+locations[index][3]+' '+locations[index][4];
			geocoder.geocode( { 'address': completeAddress}, function(results, status) {


				if (status == google.maps.GeocoderStatus.OK) {
					var latitude = results[0].geometry.location.lat();
					var longitude = results[0].geometry.location.lng();
					map.setCenter(results[0].geometry.location);
					var latlang = results[0].geometry.location;
					

					var marker = new google.maps.Marker({
						position: new google.maps.LatLng(latitude,longitude),
						map: map,

					});
					if( type == 'userInfo'){
						var content = '<a class="btn btn-default">'+locations[index].details[0].Name+'</br>'+locations[index].details[0].Phone+'</br>'+locations[index].details[0].Address.Address_line1+','+locations[index].details[0].Address.Address_line2+','+locations[index].details[0].Address.City+','+locations[index].details[0].Address.State+','+locations[index].details[0].Address.Country+'</a>';

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
				}else{
					console.log("status ",status );

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
		if(type == 'userInfo'){
			$ionicHistory.nextViewOptions({
				disableBack: true
			});
			$state.go('app.userDetail');
		}else{
			if($localStorage.userInfo.data[0].Role == 'Student'){
				$state.go('app.student');
			}else{
				$state.go('app.organizer', {}, {reload: true});
			}
		}


	}

}
