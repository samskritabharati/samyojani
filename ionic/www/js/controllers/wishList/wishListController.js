angular
.module('starter')
.controller('wishListController', wishListController);

wishListController.$inject = ['$scope', '$state','coursesService', '$localStorage','$ionicModal','userAuthenticationService','$rootScope'];

function wishListController($scope,  $state,coursesService, $localStorage,$ionicModal,userAuthenticationService, $rootScope) {
    var vm = this;
    vm.DeletClassFromMyList = DeletClassFromMyList;
    vm.showSpinner = true;
    $rootScope.currentMenu = 'wishLists';
    showMyWishList();
    vm.coursesDetailList = [];
    if($localStorage.userInfo.data[0].Name != '' || $localStorage.userInfo.data[0].Name != null){
        $localStorage.userlogin = true;

    }

    function showMyWishList(){
        coursesService.getUserWishList($localStorage.userInfo.data[0]._url).then( function (userClass){
            vm.showSpinner = false;
            angular.forEach(userClass.data, function (piece, index) {
                coursesService.getClassByUrl(piece.Course_url).then(function(courseDetail){
                    wishListDetailStructure(courseDetail.data,piece);
                },function(error){
                    console.log("error in getting activity detail",error);
                })
            });
        },function(error){
            console.log('error in getting student class',error);
        })  
    }

    function wishListDetailStructure(courseDetail,wishlistDetail){
        var wishListDetailInfo = {
            courseInfo : courseDetail,
            wishListInfo : wishlistDetail
        }
        vm.coursesDetailList.push(wishListDetailInfo);
    }

    function DeletClassFromMyList(course){
        userAuthenticationService.confirm('','Do You Want To Remove this from WishList ?','Yes','No',function(){
            vm.showSpinner = true;
            coursesService.deletClassFromUserWishList(course._url).then(function(data){
                userAuthenticationService.alertUser('Detail Removed From WishList');
                vm.showSpinner = false;
                vm.activityList = [];
                $state.go('app.wishlist', {}, {reload: true});
            },function(error){
                console.log(error);
                userAuthenticationService.alertUser('Error Occured');
            });
        },null)
    }
}