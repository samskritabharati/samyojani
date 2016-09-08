angular
.module('starter')
.controller('coursesController', coursesController);

coursesController.$inject = ['$scope', '$state','coursesService', '$localStorage','$ionicModal','userAuthenticationService'];

function coursesController($scope,  $state,coursesService, $localStorage,$ionicModal,userAuthenticationService) {
    var vm = this;
    vm.showFormToEditCourse = showFormToEditCourse;
    vm.closeModel = closeModel;
    vm.saveUpdatedclassDetail = saveUpdatedclassDetail;
    vm.deleteClass = deleteClass;
    vm.addToWishList = addToWishList;
    vm.showAddClassForm = showAddClassForm;
    vm.addClassDetail = addClassDetail;

    vm.coursesList = [];
    vm.unitOption = ["hours", "days", "weeks", "months", "years"]
    vm.durationOptions = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29]
    vm.typeOptions = ["Classroom", "Virtual", "Self-paced"]
    showCourses();

    if($localStorage.userInfo.data[0].Name != '' || $localStorage.userInfo.data[0].Name != null){
        $localStorage.userlogin = true;

    }
    
    function showCourses(){
    	coursesService.getCourses().then(function(courses){
          /*  vm.coursesList = courses.data;*/
          console.log('courses',courses);
          
           coursesService.getUserWishListList($localStorage.userInfo.data[0]._url).then( function (wishListClass){
            	console.log('wishListClass',wishListClass);
                angular.forEach(courses.data, function (key, index) {

                    var result = $.grep(wishListClass.data, function (packState) {
                    	console.log('packState',packState);
                    	console.log('key',key);
                        return  packState.Course_id == key._url;
                    });
                    console.log("result",result);
                    if (result && result.length > 0) {
                        classWithEnrollStructure(key,result[0]);
                    }
                    else {
                        classWithOutEnrollStructure(key);
                    }

                })
            },function(error){
                console.log('error in getting student class',error);
            })
        },function(error){
            console.log(error);
        });
    }

     function classWithEnrollStructure(allclass,myClass){
        var _classDetail = {
            allClass : allclass,
            myWishClass : ""               
        }
        vm.coursesList.push(_classDetail);
        console.log('vm.classListwith',vm.coursesList);
    }

    function classWithOutEnrollStructure(allclass){
        var _classDetail = {
            allClass : allclass,
            myWishClass : ""               
        }
        vm.coursesList.push(_classDetail);
        console.log('vm.classListwithout',vm.coursesList);
    }

    function  showFormToEditCourse(classDetail){

        
        
        vm.editClassDetail = classDetail;
console.log('vm.editClassDetail',vm.editClassDetail);

        $ionicModal.fromTemplateUrl('editClassDetail.html', {
            scope: $scope,
        }).then(function(modal) {
            $scope.modal = modal;
            $scope.modal.show();
        });
 
    
    }

    function closeModel(){
          $scope.modal.hide();  
    } 

    function saveUpdatedclassDetail(updatedDetail){
    	console.log(updatedDetail);
    	coursesService.updateClassDetail(updatedDetail.allClass).then(function(data){
            $scope.modal.hide();
         },function(error){
            console.log(error);
         });
    }

     function deleteClass(classToDelete){
        userAuthenticationService.confirm('','Do You Want To Delet Class?','Yes','No',function(){
            coursesService.deleteClass(classToDelete.allClass).then(function(data){
            	vm.coursesList = [];
                showCourses();
            },function(error){
                console.log(error);
            });
        },null)
        
    }

    function addToWishList(classDetail){
    	userAuthenticationService.confirm('','Do You Want Add This Class To Wish List?','Yes','No',function(){
           		vm.addwishbtn = classDetail.allClass._url
                
                    
                    var newWishList = {
                        Course_id: classDetail.allClass._url, 
                        Person_id: $localStorage.userInfo.data[0]._url, 
                        Last_active_date:new Date()
            		}
console.log('newWishList',newWishList);
                coursesService.addToMyWisList(newWishList).then(function(data){
                },function(error){
                    console.log(error);
                })
           
        },null)
    }

    function showAddClassForm(){
    	$ionicModal.fromTemplateUrl('addClassDetail.html', {
            scope: $scope,
        }).then(function(modal) {
            $scope.modal = modal;
            $scope.modal.show();
        });
    }

    function addClassDetail(newClassDetail){
coursesService.addNewClass(newClassDetail).then(function( detail){
      console.log("sssssssssss",detail);
      vm.coursesList = [];
       showCourses();
       $scope.modal.hide();
     
		},function(error){
			console.log('Error in adding activity',error);
		})
    }
}