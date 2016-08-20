angular
.module('starter')
.controller('studentController', studentController);

studentController.$inject = ['$scope', '$stateParams', '$state', '$location'];

function studentController($scope, $stateParams, $state, $location) {
     var vm = this;
     console.log($stateParams.userdata)
     vm.userName = $stateParams.userdata;


     $scope.tabs = [{
          title: 'Join a shibira',
          url: 'joinshibira.html'
     }, {
          title: 'My shibira',
          url: 'myshibira.html'

     }];

     $scope.currentTab = 'joinshibira.html';

     $scope.onClickTab = function (tab) {
          $scope.currentTab = tab.url;
     }

     $scope.isActiveTab = function(tabUrl) {
          return tabUrl == $scope.currentTab;
     }
}