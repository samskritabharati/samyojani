angular
.module('starter')
.controller('setLocationController', setLocationController);

setLocationController.$inject = ['$scope', '$state', '$localStorage', '$ionicHistory','$rootScope'];

function setLocationController($scope, $state, $localStorage,$ionicHistory,$rootScope) {
	var vm = this;

	if($localStorage.userInfo.data[0].Name != '' || $localStorage.userInfo.data[0].Name != null){
		$localStorage.userlogin = true;
	}
	$rootScope.currentMenu = 'setLocation';

	$scope.countries = {
                'India': {
                    'Maharashtra': ['Pune', 'Mumbai', 'Nagpur', 'Akola'],
                    'Madhya Pradesh': ['Indore', 'Bhopal', 'Jabalpur'],
                    'Rajasthan': ['Jaipur', 'Ajmer', 'Jodhpur']
                },
                'USA': {
                    'Alabama': ['Montgomery', 'Birmingham'],
                    'California': ['Sacramento', 'Fremont'],
                    'Illinois': ['Springfield', 'Chicago']
                },
                'Australia': {
                    'New South Wales': ['Sydney'],
                    'Victoria': ['Melbourne']
                }
            };
            $scope.GetSelectedCountry = function () {
                $scope.strCountry = document.getElementById("country").value;
            };
            $scope.GetSelectedState = function () {
                $scope.strState = document.getElementById("state").value;
            };
}