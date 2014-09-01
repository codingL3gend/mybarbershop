'use strict';

angular.module('mbs', ['mbs.services', 'mbs.controllers', 'ngRoute', 'mobile-angular-ui', 'mobile-angular-ui.scrollable', 'mobile-angular-ui.directives.toggle', 'mobile-angular-ui.directives.overlay',]) //'mobile-angular-ui.touch',
                      //'mobile-angular-ui.scrollable'])// 'ui.bootstrap', 'mbs.blueimp', ])
	   .config(['$routeProvider', '$locationProvider',
	           function ($routeProvider, $locationProvider) {
	               $locationProvider.html5Mode(true);
	               $locationProvider.hashPrefix('!');

	               /*$routeProvider.when('/barbershop', { templateUrl: 'partials/barbershop.html', controller: 'barberShopController' })
	                             .otherwise({redirectTo: 'views/index.html'});*/
	           }]);