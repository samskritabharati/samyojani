angular
.module('starter')
.controller('projectController', projectController);

projectController.$inject = ['$scope', '$state', '$localStorage', 'projectService','filterFilter','$rootScope','$ionicHistory','$ionicModal','userInfoService','userAuthenticationService','postalCodeService','$filter','setLocationService'];

function projectController($scope, $state, $localStorage, projectService,filterFilter,$rootScope, $ionicHistory, $ionicModal,userInfoService,userAuthenticationService,postalCodeService, $filter,setLocationService) {
    var vm = this;
    vm.openMap = openMap;
    vm.deleteProject = deleteProject;
    vm.showSpinner = true;
    vm.formForNewProject = formForNewProject;
    vm.closeAddProject = closeAddProject;
    vm.choosedCoordinator = choosedCoordinator;
    vm.seacrchForCoordinator = seacrchForCoordinator;
    vm.searchUser = searchUser;
    vm.addProjectDetail = addProjectDetail;
    vm.autoFillAddressDetail = autoFillAddressDetail;
    vm.formForEditProject = formForEditProject;
    vm.closeModel = closeModel;
    vm.UpdateProject = UpdateProject;
    vm.levelChangeEvent = levelChangeEvent;
    vm.editlevelChangeEvent = editlevelChangeEvent;

    vm.newProject = {
        Address : {
            Postal_code: '',
            Country: '',
            Region_url : ''
        }

    }
     
 
    $rootScope.currentMenu = 'project';

    if($localStorage.userInfo.data[0].Name != '' || $localStorage.userInfo.data[0].Name != null){
        $localStorage.userlogin = true;
    }

    if(!$rootScope.dataToEdit){
        vm.editProject = []
        getRegionsByurl($localStorage.userInfo.data[0].Region_url)
    }

    if($rootScope.dataToEdit){
        getRegionsByurl($rootScope.dataToEdit.Region_url);
        vm.editProject = $rootScope.dataToEdit;
        $rootScope.dataToEdit = ""
        var st_date = $filter('date')(vm.editProject.Start_date, 'MM/dd/yyyy');
        vm.editProject.Start_date = st_date;
        var ed_date = $filter('date')(vm.editProject.End_date, 'MM/dd/yyyy');
        vm.editProject.End_date = ed_date;
    }
    getProject();
    projectList();
    getCountry();
    getCoordinatorInfo()

    function getProject(){
        projectService.getAllProject().then(function(project){
            vm.projectList = project.data;
            $scope.currentPage = 1;
            $scope.totalItems =  vm.projectList.length;
            $scope.entryLimit = 10; 
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

    function deleteProject(projectToDelete){
        userAuthenticationService.confirm('','Do You Want To Delet Project?','Yes','No',function(){
            vm.showSpinner = true;
            projectService.deleteProject(projectToDelete).then(function(data){
                userAuthenticationService.alertUser('Project Deleted');
                getProject();
            },function(error){
                userAuthenticationService.alertUser('Error Occured');
                console.log(error);
            });
        },null)

    }

    function openMap(address){
        var locationAddress = [];
        if(address.Address_line1){
            locationAddress.push(address.Address_line1)
        }
        if(address.Address_line2){
            locationAddress.push(address.Address_line2)
        }
        if(address.Locality){
            locationAddress.push(address.Locality)
        }
        if(address.District){
            locationAddress.push(address.District)
        }
        if(address.City){
            locationAddress.push(address.City)
        }
        if(address.State){
            locationAddress.push(address.State)
        }
        if(address.Country){
            locationAddress.push(address.Country)
        }
        if(address.Postal_code){
            locationAddress.push(address.Postal_code)
        }

        var Completeaddress=""
        for (var i = 0; i < locationAddress.length; i++) {
            locationAddress[i]
            Completeaddress = Completeaddress+ locationAddress[i]
        }
        window.open("http://maps.google.com/?q=" + Completeaddress, '_system');
    }

    function formForNewProject(){

       
          /*getRegionsByurl($localStorage.userInfo.data[0].Region_url);*/
 

        $ionicHistory.nextViewOptions({
            disableBack: true
        });
        $state.go('app.addProject');
    }

    function closeAddProject(){
        $ionicHistory.nextViewOptions({
            disableBack: true
        });
        $state.go('app.project');
    }

    function projectList(){
        vm.showSpinner = true;
        projectService.projectType().then(function(project){
            vm.projecTypetList = project.data;
            vm.showSpinner = false;
        })
    }



    function seacrchForCoordinator(){
        $ionicModal.fromTemplateUrl('chooseCoordinator.html', {
            scope: $scope,
        }).then(function(modal) {
            $scope.modal = modal;
            vm.showSpinner = false;
            $scope.modal.show();
        });
    }

    function searchUser(criteria){ 
        vm.showSpinner = true;
        if(!criteria){
            userInfoService.getUser().then(function(userDetail){
                vm.showSearchCount = true;
                vm.user = userDetail;
                $scope.currentPage = 1;
                $scope.totalItems = userDetail.data.length;
                $scope.entryLimit = 5; 
                $scope.noOfPages = Math.ceil($scope.totalItems / $scope.entryLimit);

                $scope.$watch('search', function (newVal, oldVal) {
                    $scope.filtered = filterFilter(vm.user.data, newVal);
                    $scope.totalItems = $scope.filtered.length;
                    $scope.noOfPages = Math.ceil($scope.totalItems / $scope.entryLimit);
                    $scope.currentPage = 1;
                    vm.showSpinner = false;
                }, true);

            },function(error){
                console.log("Error in updating FacebookID")
            })

        }else{

            if(!criteria.name){
                criteria.name =''
            }
            if(!criteria.email){
                criteria.email =''
            }
            if(!criteria.phone){
                criteria.phone =''
            }
            if(!criteria.address){
                criteria.address =''
            }
            if(!criteria.role){
                criteria.role =''
            }
            if(!criteria.city){
                criteria.city =''
            }
            if(!criteria.country){
                criteria.country =''
            }
            if(!criteria.city){
                criteria.city =''
            }
            userInfoService.searchForUser(criteria).then(function(userDetail){
                if(userDetail.data.length > 0){
                    vm.showSearchCount = true;
                    vm.user = userDetail;
                    $scope.currentPage = 1;
                    $scope.totalItems = userDetail.data.length;
                    $scope.entryLimit = 10; 
                    $scope.noOfPages = Math.ceil($scope.totalItems / $scope.entryLimit);

                    $scope.$watch('search', function (newVal, oldVal) {

                        $scope.filtered = filterFilter(vm.user.data, newVal);
                        $scope.totalItems = $scope.filtered.length;
                        $scope.noOfPages = Math.ceil($scope.totalItems / $scope.entryLimit);
                        $scope.currentPage = 1;
                        vm.showSpinner = false;
                    }, true);
                }else{
                    userAuthenticationService.alertUser('No Matches');
                    vm.showSpinner = false;
                }
            },function(error){
                console.log("Error in updating FacebookID")
            })
        }
    }

    function choosedCoordinator(choosedData,type){
        $scope.modal.hide();
        vm.coordinatorName = choosedData.Name;

        if(vm.newProject){
            vm.newProject.Coordinator_url = choosedData._url;
        }
        if(vm.editProject){
            vm.editProject.Coordinator_url = choosedData._url;
        }

    }

    function addProjectDetail(){
        vm.showSpinner = true;
        vm.newProject.Start_date = angular.element('#st_date').val();
        vm.newProject.End_date = angular.element('#ed_date').val();
        vm.newProject.Region_url = vm.reginPathSelected;
        projectService.addProject(vm.newProject).then(function(project){
            userAuthenticationService.alertUser('Project Added Successfully');
            vm.showSpinner = false;
            $ionicHistory.nextViewOptions({
                disableBack: true
            });
            $state.go('app.project');
        },function(error){
            userAuthenticationService.alertUser('Error Occured');
            console.log(error);
        })
    }

    function autoFillAddressDetail(opType){
        if(opType== 'edit'){
            if(vm.editProject.Address.Country){

                if(vm.editProject.Address.Postal_code){
                    vm.showSpinner = true;
                    postalCodeService.getDetailsByPostalCode(vm.editProject.Address.Country,vm.editProject.Address.Postal_code).then(function(addressDetails){
                        if(addressDetails.data.length>0){
                            vm.editProject.Address = {
                                District : addressDetails.data[0].Address.District,
                                Locality : addressDetails.data[0].Address.Locality,
                                State : addressDetails.data[0].Address.State,
                                City : addressDetails.data[0].Address.City,
                                Country : addressDetails.data[0].Address.Country,
                                Postal_code : addressDetails.data[0].Address.Postal_code
                            }
                            userAuthenticationService.alertUser('Address Autofilled');
                        }
                        else{
                            userAuthenticationService.alertUser('Address Not Found');
                        }
                        vm.showSpinner = false;
                    },function(error){
                        userAuthenticationService.alertUser('Error Occured');
                        console.log(error);
                    })
                }else{
                    userAuthenticationService.alertUser('Please Enter Postal_code');
                }
            }else{
                userAuthenticationService.alertUser('Please Enter Country');
            }


        }else{

            if(vm.newProject.Address.Country){
                if(vm.newProject.Address.Postal_code){
                    vm.showSpinner = true;
                    postalCodeService.getDetailsByPostalCode(vm.newProject.Address.Country,vm.newProject.Address.Postal_code).then(function(addressDetails){
                        if(addressDetails.data.length>0){
                            vm.newProject.Address = {
                                District : addressDetails.data[0].Address.District,
                                Locality : addressDetails.data[0].Address.Locality,
                                State : addressDetails.data[0].Address.State,
                                City : addressDetails.data[0].Address.City,
                                Country : addressDetails.data[0].Address.Country,
                                Postal_code : addressDetails.data[0].Address.Postal_code
                            }
                            userAuthenticationService.alertUser('Address Autofilled');
                        }
                        else{
                            userAuthenticationService.alertUser('Address Not Found');
                        }
                        vm.showSpinner = false;
                    },function(error){
                        console.log(error);
                    })
                }else{
                    userAuthenticationService.alertUser('Please Enter Postal_code');
                }
            }else{
                userAuthenticationService.alertUser('Please Enter Country');
            }

        }

    }


    function getCountry(){
        vm.showSpinner = true;
        userInfoService.getAllCountryList().then(function(countrty){
            vm.countrList = countrty;
            vm.showSpinner = false;
        },function(error){
            console.log(error);
        })
    } 

    function formForEditProject(dataToEdit){
        $rootScope.dataToEdit = dataToEdit;
        $ionicHistory.nextViewOptions({
            disableBack: true
        });
        $state.go('app.editproject');
    }

    function closeModel(){
        $scope.modal.hide();  
    }

    function UpdateProject(projectToUpdate){
        vm.showSpinner = true;
        vm.editProject.Start_date = angular.element('#edit_st').val();
        vm.editProject.End_date = angular.element('#edit_ed').val();
         vm.editProject.Region_url =  vm.reginPathSelected;
        projectService.updateProject(projectToUpdate).then(function(updatedProject){
            userAuthenticationService.alertUser('Details Updated');
            $rootScope.dataToEdit = ""
            vm.showSpinner = false;
            $ionicHistory.nextViewOptions({
                disableBack: true
            });
            $state.go('app.project');
        },function(error){
            userAuthenticationService.alertUser('Error Occured');
            console.log('error',error);
        });
    }

    function getCoordinatorInfo(){
        if(vm.editProject){
            if(vm.editProject.Coordinator_url){
                userInfoService.getActivityCoordinatorDetail(vm.editProject.Coordinator_url).then(function(coordinatorDetails){
                    vm.showSpinner = false;
                    vm.coordinatorName = coordinatorDetails.data.Name
                },function(error){
                    console.log('error',error);
                });
            }
        }
    }

    function editlevelChangeEvent(){
        getRegionsByurl(vm.editProject.Region_url);
    }

    function levelChangeEvent(){
        getRegionsByurl(vm.newProject.Region_url);
    }

    function getRegionsByurl(region_url){
        if(region_url){
            vm.reginPathSelected = region_url;
            setLocationService.getRegionsByurl(region_url).then(function(reginUrlServiceRes){
                var listData = [];
            
                vm.newProject.Region_url = reginUrlServiceRes.data.path;
               
                    vm.editProject.Region_url = reginUrlServiceRes.data.path;
              
                
                vm.currentPath = reginUrlServiceRes.data.path
                parentData = {
                  'name': 'Up One Level',
                  'value': reginUrlServiceRes.data.Parent_region_url,
                }

                angular.forEach(reginUrlServiceRes.data.Subregions, function (key, index) {
                    var DataSructure = {
                        'name': index,
                        'value': key,
                    }
                    listData.push(DataSructure);
                });

                var filterValue = $filter('orderBy')(listData, 'name');

                vm.nextLevelData= [];
                vm.nextLevelData.push(parentData);
                angular.forEach(filterValue, function (key, index) {
                    vm.nextLevelData.push(key);
                })

                

            },function(error){
                console.log(error);
            })
        }
    } 
}