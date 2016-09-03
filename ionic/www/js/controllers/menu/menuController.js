angular
.module('starter')
.controller('menuController', menuController);

menuController.$inject = ['$scope', '$stateParams', '$state', '$location', '$localStorage', 'userInfoService' ,'$ionicHistory'];

function menuController($scope, $stateParams, $state, $location, $localStorage, userInfoService, $ionicHistory) {
    var vm = this;

    vm.showStudentClass = showStudentClass;
    vm.studentLogOut = studentLogOut;
    vm.upcomingEvent = upcomingEvent;
    vm.updateProfile = updateProfile;
    vm.redirectProject = redirectProject;
    vm.home = home;
  
    $localStorage.userlogin = false;

    $scope.$watch(function() { return   $localStorage.userlogin },
      function() {
      	/*vm.newActivity.End_time = vm.newActivity.Start_time;*/
        if(($localStorage.userlogin == false)) {
          vm.notlogin = true
          vm.student = false
          vm.other = false
        }
        if(($localStorage.userlogin == true) && ($localStorage.userInfo.data[0].Name != "" || $localStorage.userInfo.data[0].Name != null) && ($localStorage.userInfo.data[0].Role == 'Student')) {
          vm.notlogin = false
          vm.student = true
          vm.other = false
        }
        if(($localStorage.userlogin == true) && ($localStorage.userInfo.data[0].Name != "" || $localStorage.userInfo.data[0].Name != null) && ($localStorage.userInfo.data[0].Role != 'Student' )){
          vm.notlogin = false
          vm.student = false
          vm.other = true

        }
      	
      }
 	);


 	function showStudentClass(){
 		$ionicHistory.nextViewOptions({
            disableBack: true
        });
 		$state.go('app.studentClass', {}, {reload: true});
 	}

  function studentLogOut(){
    $localStorage.userlogin = false;
    $localStorage.userInfo = '';
    $localStorage.update = [];
    gapi.auth.signOut();
     FB.getLoginStatus(function(response) {
            if (response.status === 'connected') {
                FB.logout(function(response) {
                });
            }
        });
    $ionicHistory.nextViewOptions({
            disableBack: true
        });
    $state.go('app.main');
  }

  function upcomingEvent(){
    $ionicHistory.nextViewOptions({
            disableBack: true
        });
    if($localStorage.userInfo.data[0].Role == 'Student'){
       $state.go('app.student', {}, {reload: true});
     }else{
      $state.go('app.organizer', {}, {reload: true});
     }
         
  }

  function updateProfile(){
    $localStorage.update = $localStorage.userInfo.data[0].Email;
    $ionicHistory.nextViewOptions({
            disableBack: true
        });
    $state.go('app.signUp');
  }

  function redirectProject(){
    $ionicHistory.nextViewOptions({
            disableBack: true
        });
    $state.go('app.project');
  }

  function home(){
    $ionicHistory.nextViewOptions({
            disableBack: true
        });
    $state.go('app.main');
  }
 }