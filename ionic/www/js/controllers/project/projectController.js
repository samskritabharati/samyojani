angular
.module('starter')
.controller('projectController', projectController);

projectController.$inject = ['$scope', '$state', '$localStorage', 'projectService','filterFilter','$rootScope'];

function projectController($scope, $state, $localStorage, projectService,filterFilter,$rootScope) {
    var vm = this;
    vm.showSpinner = true;
    $rootScope.currentMenu = 'project';

    if($localStorage.userInfo.data[0].Name != '' || $localStorage.userInfo.data[0].Name != null){
        $localStorage.userlogin = true;
    }

    getProject()

    function getProject(){
        projectService.getAllProject().then(function(project){
            vm.projectList = project.data;
            $scope.currentPage = 1;
            $scope.totalItems =  vm.projectList.length;
            $scope.entryLimit = 5; 
            $scope.noOfPages = Math.ceil($scope.totalItems / $scope.entryLimit);
            $scope.$watch('search', function (newVal, oldVal) {
                $scope.filtered = filterFilter( vm.projectList, newVal);
                $scope.totalItems = $scope.filtered.length;
                $scope.noOfPages = Math.ceil($scope.totalItems / $scope.entryLimit);
                $scope.currentPage = 1;
                vm.showSpinner = false;
            }, true);
        })
    }
}