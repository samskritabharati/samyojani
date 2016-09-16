// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic', 'starter.controllers', 'ngMessages', 'ngStorage', 'ui.directives', 'ui.bootstrap'])

.run(function($ionicPlatform,constantsService) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);

    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }

    window.fbAsyncInit = function() {
    FB.init({
      appId      : constantsService.facebookAppId,
      xfbml      : true,
      version    : 'v2.7'
    });
  };

  (function(d, s, id){
     var js, fjs = d.getElementsByTagName(s)[0];
     if (d.getElementById(id)) {return;}
     js = d.createElement(s); js.id = id;
     js.src = "//connect.facebook.net/en_US/sdk.js";
     fjs.parentNode.insertBefore(js, fjs);
   }(document, 'script', 'facebook-jssdk'));
 
  });
})

.config(function($stateProvider, $urlRouterProvider) {
  $stateProvider

  .state('app.login', {
    cache: false,
    url: '/login',
    views: {
      'menuContent': {
        templateUrl: 'templates/login.html',
        controller: 'loginController as vm'
      }
    }                       
  })

  .state('app', {
    url: '/app',
    abstract: true,
    templateUrl: 'templates/menu.html',
    controller: 'menuController as vm'
  })

  .state('app.student', {
    cache: false,
    url: '/student',
    views: {
      'menuContent': {
        templateUrl: 'templates/student.html',
        controller: 'studentController as vm'
      }
    }
  })

  .state('app.organizer', {
    cache: false,
    url: '/organizer',
    views: {
      'menuContent': {
        templateUrl: 'templates/organizer.html',
         controller: 'organizerController as vm'
      }
    }
  })
  .state('app.main', {
    cache: false,
    url: '/main',
    views: {
      'menuContent': {
        templateUrl: 'templates/main.html',
        controller: 'loginController as vm'
      }
    }
  })
  .state('app.signUp', {
    cache: false,
    url: '/signUp',
   /* params: {
     email: null
    },*/
    views: {
      'menuContent': {
        templateUrl: 'templates/signUp.html',
        controller: 'newSignUpController as vm'
      }
    }
  })
   .state('app.addActivity', {
    cache: false,
    url: '/addactivity',
    views: {
      'menuContent': {
        templateUrl: 'templates/newActivity.html',
        controller: 'addActivityController as vm'
      }
    }
  })
  .state('app.activityDetail', {
    cache: false,
    url: '/activityDetail',
    params: {
     activityDetail: null
    },
    views: {
      'menuContent': {
        templateUrl: 'templates/activityDetail.html',
        controller: 'activityDetailController as vm'
      }
    }
  })
  .state('app.studentClass', {
    cache: false,
    url: '/studentClass',
    views: {
      'menuContent': {
        templateUrl: 'templates/studentClass.html',
        controller: 'studentClassController as vm'
      }
    }
  })
  .state('app.project', {
    cache: false,
    url: '/project',
    views: {
      'menuContent': {
        templateUrl: 'templates/project.html',
        controller: 'projectController as vm'
      }
    }
  })
  .state('app.userDetail', {
    cache: false,
    url: '/userDetail',
    views: {
      'menuContent': {
        templateUrl: 'templates/userDetail.html',
        controller: 'userDetailController as vm'
      }
    }
  })
  .state('app.courses', {
    cache: false,
    url: '/courses',
    views: {
      'menuContent': {
        templateUrl: 'templates/courses.html',
        controller: 'coursesController as vm'
      }
    }
  })
  .state('app.wishlist', {
    cache: false,
    url: '/wishlist',
    views: {
      'menuContent': {
        templateUrl: 'templates/wishList.html',
        controller: 'wishListController as vm'
      }
    }
  })
  .state('app.userProfile', {
    cache: false,
    url: '/userProfile',
    views: {
      'menuContent': {
        templateUrl: 'templates/userProfile.html',
        controller: 'userProfileController as vm'
      }
    }
  })

  .state('app.activitymapview', {
    cache: false,
    url: '/activitymapview',
    params: {
     activitys: null
    },
    views: {
      'menuContent': {
        templateUrl: 'templates/activityMapView.html',
        controller: 'activityMapViewController as vm'
      }
    }
  })


  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('app/main');
});
