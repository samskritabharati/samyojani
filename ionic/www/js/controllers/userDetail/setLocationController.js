angular
.module('starter')
.controller('setLocationController', setLocationController);

setLocationController.$inject = ['$scope', '$state', '$localStorage', '$ionicHistory','$rootScope','projectService','coursesService'];

function setLocationController($scope, $state, $localStorage,$ionicHistory,$rootScope,projectService,coursesService) {
	var vm = this;
    vm.leftArrowClick = leftArrowClick;
    vm.rightArrowClick = rightArrowClick;
    vm.level1ChangeEvent = level1ChangeEvent;
    vm.level2ChangeEvent = level2ChangeEvent;
    vm.level3ChangeEvent = level3ChangeEvent;

    vm.level1 = "";
    vm.level2 = "";
    vm.level3 = "";
    vm.nextLevel1Options = false;
    vm.nextLevel2Options = false;
    vm.nextLevel3Options = false;

	if($localStorage.userInfo.data[0].Name != '' || $localStorage.userInfo.data[0].Name != null){
		$localStorage.userlogin = true;
	}
	$rootScope.currentMenu = 'setLocation';

 

	/*$scope.countries = {
                'India': {
                    'Maharashtra': ['Pune', 'Mumbai', 'Nagpur', 'Akola'],
                    'Madhya Pradesh': ['Indore', 'Bhopal', 'Jabalpur'],
                    'Rajasthan': ['Jaipur', 'Ajmer', 'Jodhpur']
                },
                'USA': {
                    'Alabama': ['Montgomery', 'Birmingham'],
                    'California': ['Sacramento', 'Fremont'],
                    'Illinois': ['Springfield', 'Chicago']
                },
                'Australia': {
                    'New South Wales': ['Sydney'],
                    'Victoria': ['Melbourne']
                }
            };
            $scope.GetSelectedCountry = function () {
               
                $scope.strCountry = document.getElementById("country").innerHTML;
                console.log(JSON.stringify($scope.strCountry));
            };
            $scope.GetSelectedState = function () {
                $scope.strState = document.getElementById("state").value;
            };*/

            vm.parent = 'world';
            vm.currentValue = vm.parent;

           function rightArrowClick(){
           
            if(vm.parent != "" && vm.level1 == "" && vm.level2 == "" && vm.level3 == ""){
                projectService.getAllProject().then(function(project){
                    vm.nextLevelData1 = project.data;
                })
                console.log("1st level");
                vm.nextLevel1Options = true;
                vm.nextLevel2Options = false;
                vm.nextLevel3Options = false;
            }

            if(vm.parent != "" && vm.level1 != "" && vm.level2 == "" && vm.level3 == ""){
                console.log("2nd level")
                vm.nextLevelData1 = [];
                vm.nextLevelData3 = [];
                vm.nextLevel1Options = false;
                vm.nextLevel2Options = true;
                vm.nextLevel3Options = false;
                coursesService.getCourses().then(function(courses){
                    vm.nextLevelData2 = courses.data;
                })
                
            }

             if(vm.parent != "" && vm.level1 != "" && vm.level2 != "" && vm.level3 == ""){
                console.log("2nd level")
                vm.nextLevelData1 = [];
                vm.nextLevelData2 = [];
                vm.nextLevel1Options = false;
                vm.nextLevel2Options = false;
                vm.nextLevel3Options = true;
                 projectService.getAllProject().then(function(project){
                    vm.nextLevelData3 = project.data;
                })
                
            }
           }

           function leftArrowClick(){
            /*console.log("lestt arow")
             if(vm.parent != "" && vm.level1 == "" && vm.level2 == "" && vm.level3 == ""){
                projectService.getAllProject().then(function(project){
                    vm.nextLevelData = project.data;
                })
                console.log("1st level");
                vm.nextLevel1Options = true;
                vm.nextLevel2Options = false;
                vm.nextLevel3Options = false;
            }

            if(vm.parent != "" && vm.level1 != "" && vm.level2 == "" && vm.level3 == ""){
                console.log("2nd level");

                projectService.getAllProject().then(function(project){
                    vm.nextLevelData = project.data;
                })
                console.log("1st level");
                vm.nextLevel1Options = true;
                vm.nextLevel2Options = false;
                vm.nextLevel3Options = false;
                vm.level1 = ""

                
            }*/

             if(vm.parent != "" && vm.level1 != "" && vm.level2 != "" && vm.level3 == ""){
                console.log("3nd level");
                /* vm.nextLevelData2 = ""
                  vm.nextLevelData3 = ""*/
                projectService.getAllProject().then(function(project){
                    vm.nextLevelData1 = project.data;
                })
                vm.currentValue =  vm.level1;
                vm.nextLevel1Options = true;
                vm.nextLevel2Options = false;
                vm.nextLevel3Options = false;
               

                
            }



           }

           function level1ChangeEvent(){
              
                     console.log("level1Changes")
                    console.log("vm.newActivity.Project_url",vm.selectedData1);
                    vm.level1 = vm.selectedData1.Name;
                    vm.currentValue = vm.selectedData1.Name;
             
                 /*if(vm.parent != "" && vm.level1 != "" && vm.level2 == "" && vm.level3 == "" ){
                    console.log("level2Changesdfssssssssssssss")
                    console.log("vm.newActivity",vm.selectedData);
                    vm.level2 = vm.selectedData.Name;
                    vm.currentValue = vm.selectedData.Name;
                 }*/
           }

           function level2ChangeEvent(){
            console.log("leve2");
            console.log("ty",vm.level2 )
            vm.level2 = vm.selectedData2.Name;
            console.log("af",vm.level2 )
            vm.currentValue = vm.selectedData2.Name;
           }

           function level3ChangeEvent(){
            console.log("leve3");
            console.log("ty",vm.level2 )
            vm.level3 = vm.selectedData3.Name;
            console.log("af",vm.level2 )
            vm.currentValue = vm.selectedData3.Name;
           }

         
}