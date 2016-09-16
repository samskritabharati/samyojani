angular
.module('starter')
.controller('coursesController', coursesController);

coursesController.$inject = ['$scope', '$state','coursesService', '$localStorage','$ionicModal','userAuthenticationService','filterFilter','$rootScope'];

function coursesController($scope,  $state,coursesService, $localStorage,$ionicModal,userAuthenticationService,filterFilter,$rootScope) {
	var vm = this;
	vm.showSpinner = true
	vm.showFormToEditCourse = showFormToEditCourse;
	vm.closeModel = closeModel;
	vm.saveUpdatedclassDetail = saveUpdatedclassDetail;
	vm.deleteClass = deleteClass;
	vm.addToWishList = addToWishList;
	vm.showAddClassForm = showAddClassForm;
	vm.addClassDetail = addClassDetail;
	vm.role = $localStorage.userInfo.data[0].Role;
	vm.coursesList = [];
	$rootScope.currentMenu = 'courses';
	vm.newClassDetail = {Units: 'days',
		Duration: 1,
	Type : 'Classroom'}
	vm.unitOption = ["hours", "days", "weeks", "months", "years"]
	vm.durationOptions = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29]
	vm.typeOptions = ["Classroom", "Virtual", "Self-paced"]
	showCourses();

	if($localStorage.userInfo.data[0].Name != '' || $localStorage.userInfo.data[0].Name != null){
		$localStorage.userlogin = true;

	}

	function showCourses(){
		vm.showSpinner = true;
		coursesService.getCourses().then(function(courses){
			if(courses.data.length > 0){
				coursesService.getUserWishListList($localStorage.userInfo.data[0]._url).then( function (wishListClass){
					angular.forEach(courses.data, function (key, index) {
						vm.showSpinner = false;
						var result = $.grep(wishListClass.data, function (packState) {
							return  packState.Course_url == key._url;
						});
						if (result && result.length > 0) {
							classWithEnrollStructure(key,result[0]);
						}
						else {
							classWithOutEnrollStructure(key);
						}

					})

					$scope.currentPage = 1;
		            $scope.totalItems =  vm.coursesList.length;
		            $scope.entryLimit = 5; 
		            $scope.noOfPages = Math.ceil($scope.totalItems / $scope.entryLimit);

            		$scope.$watch('search', function (newVal, oldVal) {

		                $scope.filtered = filterFilter( vm.coursesList, newVal);
		                $scope.totalItems = $scope.filtered.length;
		                $scope.noOfPages = Math.ceil($scope.totalItems / $scope.entryLimit);
		                $scope.currentPage = 1;
		                vm.showSpinner = false;
            		}, true);

				},function(error){
					console.log('error in getting student class',error);
				})
			}else{
				vm.showSpinner = false;
			}
			
		},function(error){
			console.log(error);
		});
	}

	function classWithEnrollStructure(allclass,myClass){
		var _classDetail = {
			allClass : allclass,
			myWishClass : myClass               
		}
		vm.coursesList.push(_classDetail);
	}

	function classWithOutEnrollStructure(allclass){
		var _classDetail = {
			allClass : allclass,
			myWishClass : ""               
		}
		vm.coursesList.push(_classDetail);
	}

	function  showFormToEditCourse(classDetail){
		vm.showSpinner = true       
		vm.editClassDetail = classDetail;

		$ionicModal.fromTemplateUrl('editClassDetail.html', {
			scope: $scope,
		}).then(function(modal) {
			$scope.modal = modal;
			vm.showSpinner = false
			$scope.modal.show();
		});
	}

	function closeModel(){
		$scope.modal.hide();  
		showCourses();
		vm.coursesList = [];
	} 

	function saveUpdatedclassDetail(updatedDetail){
		vm.showSpinner = true
		coursesService.updateClassDetail(updatedDetail.allClass).then(function(data){
			vm.showSpinner = false
			$scope.modal.hide();
		},function(error){
			console.log(error);
		});
	}

	function deleteClass(classToDelete){
		
		userAuthenticationService.confirm('','Do You Want To Delet Class?','Yes','No',function(){
			vm.showSpinner = true
			coursesService.deleteClass(classToDelete.allClass).then(function(data){
				vm.coursesList = [];
				vm.showSpinner = false
				showCourses();
			},function(error){
				console.log(error);
			});
		},function(){
			vm.showSpinner = false;
		})

	}

	function addToWishList(classDetail){
		userAuthenticationService.confirm('','Do You Want Add This Class To Wish List?','Yes','No',function(){
			vm.addwishbtn = classDetail.allClass._url
			vm.showSpinner = true

			var newWishList = {
				Course_url: classDetail.allClass._url, 
				Person_url: $localStorage.userInfo.data[0]._url, 
				Last_active_date:new Date()
			}
			coursesService.addToMyWisList(newWishList).then(function(data){
				vm.showSpinner = false
			},function(error){
				console.log(error);
			})

		},function(){
			vm.showSpinner = false;
		})
	}

	function showAddClassForm(){
		vm.showSpinner = true
		$ionicModal.fromTemplateUrl('addClassDetail.html', {
			scope: $scope,
		}).then(function(modal) {
			$scope.modal = modal;
			vm.showSpinner = false
			$scope.modal.show();
		});
	}

	function addClassDetail(newClassDetail){
		vm.showSpinner = true
		coursesService.addNewClass(newClassDetail).then(function( detail){
			vm.coursesList = [];
			showCourses();
			vm.showSpinner = false
			$scope.modal.hide();

		},function(error){
			console.log('Error in adding activity',error);
		})
	}
}