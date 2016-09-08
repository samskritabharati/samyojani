angular
.module('starter')
.controller('wishListController', wishListController);

wishListController.$inject = ['$scope', '$state','coursesService', '$localStorage','$ionicModal','userAuthenticationService'];

function wishListController($scope,  $state,coursesService, $localStorage,$ionicModal,userAuthenticationService) {
    var vm = this;
}