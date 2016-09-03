(function() {
    'use strict';
	
	
    var constantsService_app = {
		url: 'http://app.samskritabharati.in',
		facebookAppId : '168029083629718',
		googleId: '263423522351-9je87ajk003c55riacpphn7hk3dlh5hn' };
        
    var constantsService_local = {
		url: 'http://54.254.167.246',
		facebookAppId : '1611634565814061',
		googleId: '263423522351-9je87ajk003c55riacpphn7hk3dlh5hn'
        
	};
    angular.module("starter").constant('constantsService', constantsService_local);
})();
