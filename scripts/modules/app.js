'use strict';

angular.module('mbs', ['ionic', 'ngCordova', 'mbs.controllers', 'mbs.services', 'mbs.directives', 'ngRoute', 'ngSanitize', 'ui.calendar', 'oitozero.ngSweetAlert', /*, 'ui.bootstrap' 'ngTouch', 'mobile-angular-ui', 'mobile-angular-ui.scrollable', 'mobile-angular-ui.directives.toggle', 'mobile-angular-ui.directives.overlay'*/]) //'mobile-angular-ui.touch',
                      //'mobile-angular-ui.scrollable'])//  'mbs.blueimp', ])
	      .run(function ($ionicPlatform, $rootScope, $state, $stateParams, $cordovaPush, MbsAPI/*, $cordovaSplashscreen*/){
	          $rootScope.$state = $state;
	          $rootScope.$stateParams = $stateParams;

              $ionicPlatform.ready(function() {
                // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
                  // for form inputs)
                if(window.cordova && cordova.plugins.Keyboard) {
                  cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
                }
                /*if(window.StatusBar) {
                  // org.apache.cordova.statusbar required
                    StatusBar.styleDefault();
                    var sc = screen;
                }*/

                var config;

                if (ionic.Platform.isIOS())
                    config = {
                        "badge": "true",
                        "sound": "true",
                        "alert": "true",
                    }
                else
                    if (ionic.Platform.isAndroid()) {
                        config = {
                            "senderID": "546905773703"
                        }
                    }
                    else
                        if (ionic.Platform.isWindowsPhone())
                            config = {

                            }

                //splashScreen = $cordovaSplashscreen;

                $cordovaPush.register(config).then(function (result) {
                    
                    if (ionic.Platform.isIOS())
                    {
                        iosTok = result;
                        platformType = "platform_type_ios";

                       if (db) 
                            db.transaction(checkUser, errorCB);
                    }

                    //console.log("result: " + result);

                    }, function (err) {
                    // Error
                });

                  // WARNING: dangerous to unregister (results in loss of tokenID)
                  //$cordovaPush.unregister(options).then(function(result) {
                  //    // Success!
                  //}, function(err) {
                  //    // Error
                  //});
              });
           }).config(function($stateProvider, $urlRouterProvider) {
	        	// Ionic uses AngularUI Router which uses the concept of states
	        	// Learn more here: https://github.com/angular-ui/ui-router
	        	// Set up the various states which the app can be in.
	        	// Each state's controller can be found in controllers.js
               $stateProvider.state('mybarbershop', {
                   url: "/barbershop"
               }).state('login', {
                   url: '/barbershop/login',
                   templateUrl: 'templates/login.html',
                   controller: 'authController'
               }).state('main', {
                   url: '/barbershop/main',
                   templateUrl: 'templates/main.html',
                   controller: 'siteController'
               }).state('barbershop', {
                   url: '/barbershop/shop/:barberShopID',
                   templateUrl: 'templates/barbershop.html',
                   controller: 'barberShopController'
               }).state('barber', {
                   url: '/barbershop/barber/:barberID',
                   templateUrl: 'templates/barber.html',
                   controller: 'barberController'
               }).state('user', {
                   url: '/barbershop/profile/:profileID',
                   templateUrl: 'templates/profile.html',
                   controller: 'profileController'
               }).state('barbersetup', {
                   url: '/barbershop/barbersetup/:barberID',
                   templateUrl: 'templates/barbersetup.html',
                   controller: 'barberSetupController'
               }).state('appointment', {
                   url: '/barbershop/appointment/:barberID/:barberProfileID/:apptType',
                   templateUrl: 'templates/appointment.html',
                   controller: 'appointmentController'
               }).state('userprofile', {
                   url: '/barbershop/user/profile/:profileID',
                   templateUrl: 'templates/userprofile.html',
                   controller: 'userProfileController'
               }).state('barberprofile', {
                   url: '/barbershop/barber/profile/:barberID',
                   templateUrl: 'templates/barberprofile.html',
                   controller: 'barberProfileController'
               }).state('gallery', {
                   url: '/barbershop/gallery/:userID/:type',
                   templateUrl: 'templates/gallery.html',
                   controller: 'galleryController'
               }).state('shopsearch', {
                   url: '/barbershop/search/:type',
                   templateUrl: 'templates/search.html',
                   controller: 'searchController'
               }).state('notifications', {
                   url: '/barbershop/notifications',
                   templateUrl: 'templates/notifications.html',
                   controller: 'notificationsController'
               }).state('barbersearch', {
                   url: '/barbershop/barbersearch',
                   templateUrl: 'templates/barbersearch.html',
                   controller: 'barberSearchController'
               }).state('squarepayment', {
                   url: '/barbershop/payment/square',
                   templateUrl: 'templates/square.html',
                   controller: 'squarePaymentController'
               }).state('sideview', {
                   url: '/barbershop/side/view/:type',
                   templateUrl: 'templates/sideview.html',
                   controller: 'sideViewController'
               }).state('createappointment', {
                   url: '/barbershop/create/appointment/:barberID/:barberProfileID/:apptType',
                   templateUrl: 'templates/createappointment.html',
                   controller: 'createAppointmentController'
               });

	        	// if none of the above states are matched, use this as the fallback
	        	$urlRouterProvider.otherwise('/barbershop/login');

            });


/*.config(['$routeProvider', '$locationProvider',
   function ($routeProvider, $locationProvider) {
       $locationProvider.html5Mode(true);//.hashPrefix('!');

       /*$routeProvider//.when('/', { redirectTo: '/index'})
                     .when('/', { templateUrl: '/partials/home.html', controller: 'siteController'})
                     .when('/barberprofile/:barberID', { templateUrl: '/partials/barberprofile.html', controller: 'barberProfileController' })
                     .when('/barbershop/:barberShopID', { templateUrl: '/partials/barbershop.html', controller: 'barberShopController' });
                     //.otherwise({redirectTo: '/index'});
   }])*/