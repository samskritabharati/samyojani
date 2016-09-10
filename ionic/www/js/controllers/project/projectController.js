angular
.module('starter')
.controller('projectController', projectController);

projectController.$inject = ['$scope', '$stateParams', '$state', '$localStorage', 'projectService','filterFilter'];

function projectController($scope, $stateParams, $state, $localStorage, projectService,filterFilter) {
    var vm = this;
    vm.showSpinner = true;
    vm.userName = $localStorage.userInfo.data[0].Name;

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