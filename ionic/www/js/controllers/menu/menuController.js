angular
.module('starter')
.controller('menuController', menuController);

menuController.$inject = ['$scope', '$stateParams', '$state', '$location', '$rootScope', 'userInfoService' ,'$ionicHistory'];

function menuController($scope, $stateParams, $state, $location, $rootScope, userInfoService, $ionicHistory) {
    var vm = this;

    vm.showStudentClass = showStudentClass;
    $rootScope.userlogin = false;

    $scope.$watch(function() { return  $rootScope.userlogin },
      function() {
      	/*vm.newActivity.End_time = vm.newActivity.Start_time;*/
      	console.log('from menu',$rootScope.userlogin);
      	vm.show = $rootScope.userlogin
      }
 	);


 	function showStudentClass(){
 		$ionicHistory.nextViewOptions({
            disableBack: true
        });
 		$state.go('app.studentClass');
 	}
 }