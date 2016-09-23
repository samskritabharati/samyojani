(function() {
    'use strict';
	
	
    var constantsService_app = {
		url: 'http://app.samskritabharati.in',
		facebookAppId : '168029083629718',
		googleId: '263423522351-9je87ajk003c55riacpphn7hk3dlh5hn' };

    var constantsService_dev = $.extend({}, constantsService_local);
    constantsService_dev.url = 'http://samvit.samskritabharati.in';
        
    var constantsService_local = {
		url: 'http://app.samskritabharati.in',
		facebookAppId : '1611634565814061',
		googleId: '50553260606-883fcje3co9pdt8v6dhcdgbbfaqvo90b'
        
	};
    angular.module("starter").constant('constantsService', constantsService_app);
})();
