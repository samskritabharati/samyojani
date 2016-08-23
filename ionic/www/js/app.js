// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic', 'starter.controllers', 'ngMessages'])

.run(function($ionicPlatform) {
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
      appId      : '1611634565814061',
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
    controller: 'AppCtrl'
  })

  .state('app.student', {
    url: '/student/:userdata',
    views: {
      'menuContent': {
        templateUrl: 'templates/student.html',
        controller: 'studentController as vm'
      }
    }
  })

  .state('app.organizer', {
    url: '/organizer',
    views: {
      'menuContent': {
        templateUrl: 'templates/organizer.html',
         controller: 'organizerController as vm'
      }
    }
  })
  .state('app.main', {
    url: '/main',
    views: {
      'menuContent': {
        templateUrl: 'templates/main.html',
        controller: 'loginController as vm'
      }
    }
  })
  .state('app.signUp', {
    url: '/signUp',
    views: {
      'menuContent': {
        templateUrl: 'templates/signUp.html',
        controller: 'loginController as vm'
      }
    }
  })
  .state('app.activityDetail', {
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

  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('app/main');
});
