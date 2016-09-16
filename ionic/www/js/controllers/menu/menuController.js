angular
.module('starter')
.controller('menuController', menuController);

menuController.$inject = ['$scope', '$stateParams', '$state', '$location', '$localStorage', 'userInfoService' ,'$ionicHistory','$rootScope'];

function menuController($scope, $stateParams, $state, $location, $localStorage, userInfoService, $ionicHistory,$rootScope) {
    var vm = this;

    vm.showStudentClass = showStudentClass;
    vm.studentLogOut = studentLogOut;
    vm.upcomingEvent = upcomingEvent;
    vm.updateProfile = updateProfile;
    vm.redirectProject = redirectProject;
    vm.home = home;
    vm.redirectUserDetail = redirectUserDetail;
    vm.showCourses = showCourses;
    vm.showWishList = showWishList;
   
  
    $localStorage.userlogin = false;

    $scope.$watch(function() { return   $localStorage.userlogin },
      function() {
      	/*vm.newActivity.End_time = vm.newActivity.Start_time;*/
        if(($localStorage.userlogin == false)) {
          vm.notlogin = true;
          vm.student = false;
          vm.other = false;
          vm.userName = ""
        }
        if(($localStorage.userlogin == true) && ($localStorage.userInfo.data[0].Name != "" || $localStorage.userInfo.data[0].Name != null) && ($localStorage.userInfo.data[0].Role == 'Student')) {
          vm.notlogin = false;
          vm.student = true;
          vm.other = false;
          vm.userName = $localStorage.userInfo.data[0].Name
        }
        if(($localStorage.userlogin == true) && ($localStorage.userInfo.data[0].Name != "" || $localStorage.userInfo.data[0].Name != null) && ($localStorage.userInfo.data[0].Role != 'Student' )){
          vm.notlogin = false;
          vm.student = false;
          vm.other = true;
          vm.userName = $localStorage.userInfo.data[0].Name

        }
      	
      }
 	);
     
 $scope.$watch(function() { return   $rootScope.currentMenu },
      function() {
        console.log("$rootScope.currentMenu",$rootScope.currentMenu);
        vm.currentTab = $rootScope.currentMenu;
        console.log('vm.currentTab',vm.currentTab);
      })

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
    /*gapi.auth.signOut();
     FB.getLoginStatus(function(response) {
            if (response.status === 'connected') {
                FB.logout(function(response) {
                });
            }
        });*/
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
   /* $localStorage.update = $localStorage.userInfo.data[0].Email;*/
    $ionicHistory.nextViewOptions({
            disableBack: true
        });
    $state.go('app.userProfile');
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

  function redirectUserDetail(){
    $ionicHistory.nextViewOptions({
            disableBack: true
        });
    $state.go('app.userDetail');
  }

  function showCourses(){
     $ionicHistory.nextViewOptions({
            disableBack: true
        });
    $state.go('app.courses');
  }
  
  function showWishList(){
     $ionicHistory.nextViewOptions({
            disableBack: true
        });
    $state.go('app.wishlist');
  }
 }