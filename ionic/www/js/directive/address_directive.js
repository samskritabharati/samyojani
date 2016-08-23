angular.module('starter')
	.directive('address', function($parse) {
    return {
	    scope: {
	            addressObject: '=parameter'
	        },
	    template: '<p><span ng-if="addressObject.City">{{addressObject.City}}</span><span ng-if="addressObject.District">,{{addressObject.District}}</span><span ng-if="addressObject.State">,{{addressObject.State}}</span><span ng-if="addressObject.Country">,{{addressObject.Country}}</span><span ng-if="addressObject.Pincode">,{{addressObject.Pincode}}</span></p>',
    }
})