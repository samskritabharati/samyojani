angular
.module('starter')
.controller('projectController', projectController);

projectController.$inject = ['$scope', '$stateParams', '$state', '$localStorage', 'projectService'];

function projectController($scope, $stateParams, $state, $localStorage, projectService) {
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
            vm.showSpinner = false;
        })
   	}
}