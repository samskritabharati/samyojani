angular
.module('starter')
.controller('editactivitysController', editactivitysController);

editactivitysController.$inject = ['$scope', '$stateParams', '$state','userInfoService','$ionicModal','userAuthenticationService', 'projectService', '$localStorage','$ionicHistory','$timeout' ,'activityService' ,'filterFilter','$rootScope','$filter','$ionicPopup','postalCodeService','setLocationService'];

function editactivitysController($scope, $stateParams, $state, userInfoService, $ionicModal, userAuthenticationService, projectService, $localStorage,$ionicHistory,$timeout,activityService,filterFilter,$rootScope,$filter,$ionicPopup,postalCodeService,setLocationService) {
	var vm = this;
	vm.showSpinner = false;
	vm.saveUpdatedActivityDetail = saveUpdatedActivityDetail;
	vm.Activity = $state.params.editdata;
	vm.closeModel = closeModel;
	vm.editActivity = vm.Activity;
	vm.seacrchForCoordinator = seacrchForCoordinator;
	vm.searchUser = searchUser;
	vm.choosedCoordinator =  choosedCoordinator;
	vm.closeThisModel = closeThisModel;	
	vm.autoFillAddressDetail = autoFillAddressDetail;
	vm.levelChangeEvent = levelChangeEvent;

	var st_date = $filter('date')(vm.Activity.Start_date, 'MM/dd/yyyy');
	vm.editActivity.Start_date = st_date;
	var ed_date = $filter('date')(vm.Activity.End_date, 'MM/dd/yyyy');
	vm.editActivity.End_date = ed_date;

	 getRegionsByurl(vm.editActivity.Region_url);

	userInfoService.getAllActivity().then(function(activity){
		vm.activityList= activity.data ;
	})
	getCoordinatorInfo();
	projectList();
	recurrenceList();
	daysList();
	getCountry();


	function getCoordinatorInfo(){
		if(vm.editActivity.Coordinator_url){
			userInfoService.getActivityCoordinatorDetail(vm.editActivity.Coordinator_url).then(function(coordinatorDetails){
				vm.showSpinner = false;
				vm.coordinatorName = coordinatorDetails.data.Name
			},function(error){
				console.log('error',error);
			});
		}
	}

	function saveUpdatedActivityDetail(updatedActivity){
		vm.showSpinner = true;
		vm.editActivity.Start_date = angular.element('#edit_st').val();
		vm.editActivity.End_date = angular.element('#edit_ed').val();
		 vm.editActivity.Region_url =  vm.reginPathSelected;
		userInfoService.updateActivity(vm.editActivity).then(function(data){
			vm.showSpinner = false;
			userAuthenticationService.alertUser('Activity Updated Successfully');
			$ionicHistory.nextViewOptions({
				disableBack: true
			});
			$state.go('app.organizer');
		},function(error){
			console.log(error);
		});
	}

	function closeModel(){
		$ionicHistory.nextViewOptions({
			disableBack: true
		});
		$state.go('app.organizer');
	} 

	function recurrenceList(){
		vm.showSpinner = true;
		activityService.getRecurrence().then(function(recurrence){
			vm.recurrenceList = recurrence;
			vm.showSpinner = false;
		})
	}

	function projectList(){
		vm.showSpinner = true;
		projectService.getAllProject().then(function(project){
			vm.projectList = project.data;
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
					vm.showSpinner = false;
					userAuthenticationService.alertUser('No Matches ');
				}
			},function(error){
				console.log("Error in updating FacebookID")
			})
		}
	}

	function choosedCoordinator(choosedData){
		$scope.modal.hide();
		vm.editActivity.Coordinator_url = choosedData._url;
		vm.coordinatorName = choosedData.Name;      
	}

	function closeThisModel(){
		$scope.modal.hide();
	}

	function daysList(){
		vm.showSpinner = true;
		activityService.getAllDays().then(function(daysList){
			vm.daysList= daysList.data;
			vm.showSpinner = false;
		})
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

	function autoFillAddressDetail(){
		if(vm.editActivity.Address.Country){
			if(vm.editActivity.Address.Postal_code){
				vm.showSpinner = true;
				postalCodeService.getDetailsByPostalCode(vm.editActivity.Address.Country,vm.editActivity.Address.Postal_code).then(function(addressDetails){
					if(addressDetails.data.length>0){
						vm.editActivity.Address = {
							District : addressDetails.data[0].Address.District,
							Locality : addressDetails.data[0].Address.Locality,
							State : addressDetails.data[0].Address.State,
							City : addressDetails.data[0].Address.City,
							Country : addressDetails.data[0].Address.Country,
							Postal_code : addressDetails.data[0].Address.Postal_code
						}
						userAuthenticationService.alertUser('Address Autofilled');
					}else{
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

	function levelChangeEvent(){
        getRegionsByurl(vm.editActivity.Region_url);
    }

    function getRegionsByurl(region_url){
        if(region_url){
            vm.reginPathSelected = region_url;
            setLocationService.getRegionsByurl(region_url).then(function(reginUrlServiceRes){
                var listData = [];
            
              
               
                    vm.editActivity.Region_url = reginUrlServiceRes.data.path;
              
                
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