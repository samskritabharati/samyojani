angular
.module('starter')
.controller('wishListController', wishListController);

wishListController.$inject = ['$scope', '$state','coursesService', '$localStorage','$ionicModal','userAuthenticationService'];

function wishListController($scope,  $state,coursesService, $localStorage,$ionicModal,userAuthenticationService) {
    var vm = this;
    vm.DeletClassFromMyList = DeletClassFromMyList;

    showMyWishList();
    vm.coursesDetailList = [];
    if($localStorage.userInfo.data[0].Name != '' || $localStorage.userInfo.data[0].Name != null){
        $localStorage.userlogin = true;

    }

    function showMyWishList(){
    	 coursesService.getUserWishList($localStorage.userInfo.data[0]._url).then( function (userClass){
            angular.forEach(userClass.data, function (piece, index) {
                coursesService.getClassByUrl(piece.Course_url).then(function(courseDetail){
                    wishListDetailStructure(courseDetail.data);
                },function(error){
                    console.log("error in getting activity detail",error);
                })
            });
        },function(error){
            console.log('error in getting student class',error);
        })  
    }

    function wishListDetailStructure(courseDetail){
    	vm.coursesDetailList.push(courseDetail);
    	console.log("vm.coursesDetailList",vm.coursesDetailList);
    }

    function DeletClassFromMyList(course){
    	 coursesService.deletClassFromUserWishList(course._url).then(function(data){
            console.log('class Deletd');
            vm.activityList = [];
            $state.go('app.wishlist', {}, {reload: true});
        });
    }
}