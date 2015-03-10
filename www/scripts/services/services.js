'use strict';

angular.module('mbs.services', ['ngRoute', 'ngResource'])
	   .factory('MbsAPI',
			   function ($resource) {
			       return $resource('http://107.146.188.140\\:8080/my.barber.shop.api/:call/:values', { call: '', values: '' },
                                    {//98.71.97.100
                                        //		   								query: {method: 'GET', params:{phoneId: 'phones'}, isArray:true},
                                        checkUsername: { method: 'GET' },
                                        createUser: { method: 'GET' },
                                        deleteUser: { method: 'GET' },
                                        loginUser: { method: 'GET' },
                                        updatePasswordQuestion: { method: 'GET' },
                                        forgotPassword: { method: 'GET' },
                                        resetPassword: { method: 'GET' },

                                        getBarberShops: { method: 'GET' },
                                        createBarberShop: { method: 'GET' },
                                        getBarberShopDetails: { method: 'GET' },
                                        getNearbyBarberShops: { method: 'GET' },
                                        getBarbers: { method: 'GET' },
                                        
                                        createBarberShopCustomer: { method: 'GET' },
                                        createBarberClient: { method: 'GET' },

                                        getBarberAppointments: { method: 'GET' },
                                        getCustomerAppointments: { method: 'GET' },
                                        createAppointment: { method: 'GET' },
                                        deleteAppointment: { method: 'GET' },

                                        updateUser: { method: 'GET' },

                                        getUserProfile: { method: 'GET' },
                                        getBaberProfile: { method: 'GET' },
                                        updateBarberInfo: { method: 'GET' },
                                        updateUserInfo: { method: 'GET' },
                                        
                                        createBarberSchedule: { method: 'GET' },
                                        updateBarberSchedule: { method: 'GET' },
                                        
                                        getSpecialties: { method: 'GET' },
                                        createBarberSpecialties: { method: 'GET' },
                                        
                                        createBarberRating: { method: 'GET' },
                                        updateBarberRating: { method: 'GET' },

                                        updateBarberStatus: { method: 'GET' },

                                        getUserImages: { method: 'GET' },
                                        getUserVideos: { method: 'GET' },
                                        deleteBarberShopImage: { method: 'GET' },
                                        deleteUserImage: { method: 'GET' },
                                        updateBarberShopProfileImage: { method: 'GET' },
                                        updateUserProfileImage: { method: 'GET' },

                                        uploadImage: { method: 'POST' },

                                        registerForPushNotifications: { method: 'GET'}
                                    });
			   })
        .factory('camera', ['$rootScope', '$q', function ($rootScope, $q) {
            return {
                getPicture: function (options) {
                    var defered = $q.defer();

                    if (true) {
                        var fileInput = document.createElement('input');
                        fileInput.setAttribute('type', 'file');

                        fileInput.onchange = function () {
                            var file = fileInput.files[0];
                            var reader = new FileReader();
                            reader.readAsDataURL(file);
                            reader.onloadend = function () {
                                $rootScope.$apply(function () {
                                    var encodedData = reader.result.replace(/data:image\/jpeg;base64,/, '');
                                    defered.resolve(encodedData);
                                });
                            };
                        };

                        fileInput.click();
                    } else
                    {
                        var defaultOptions = {
                            quality: 75,
                            destinationType: Camera.DestinationType.DATA_URL,
                            allowEdit: true,
                            targetWidth: 75,
                            targetHeight: 75
                        };

                        options = angular.extend(defaultOptions, options);

                        var success = function (imageData) {
                            $rootScope.$apply(function () {
                                defered.resolve(imageData);
                            });
                        };

                        var fail = function (message) {
                            $rootScope.$apply(function () {
                                defered.reject(message);
                            });
                        };

                        navigator.camera.getPicture(success, fail, options);
                    }

                    return defered.promise;
                }
            };
        }])
        .factory("cordova", ['$q', "$window", "$timeout", function ($q, $window, $timeout) {
            var deferred = $q.defer();
            var resolved = false;

            document.addEventListener('deviceready', function () {
                resolved = true;
                deferred.resolve($window.cordova);
            }, false);

            $timeout(function () {
                if (!resolved && $window.cordova) {
                    deferred.resolve($window.cordova);
                }
            });

            return { ready: deferred.promise };
        }]);
    
