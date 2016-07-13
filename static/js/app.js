var app = angular.module('myApp', []);
    
app.directive('signup',function(){
		return{
			restrict:'E',
			templateUrl:'/signup'		
		}	
	});


    
app.directive('google',function(){
		return{
			restrict:'AEC',
			templateUrl:'/teacherfinder'		
		}	
	});

app.directive('sjoined',function(){
		return{
			restrict:'AEC',
			templateUrl:'/sjoined'		
		}	
	});

app.directive('landpage',function(){
		return{
			restrict:'AEC',
			templateUrl:'/landpage'		
		}	
	});
