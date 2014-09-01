'use strict';

/**controllers*/
var authFailed = false;
var url = 'http://localhost:8080/scout.me.out.api/file/upload/image/j.ant.wallace@gmail.com/2';

angular.module('mbs.controllers', [])
        .controller('MainCtrl', ['$scope', 'geolocation', function ($scope, geolocation) {
           // app.initialize();
            geolocation.getCurrentPosition(function (position) {
                alert(position);
                alert('Latitude: '              + position.coords.latitude          + '\n' +
                      'Longitude: '             + position.coords.longitude         + '\n' +
                      'Altitude: '              + position.coords.altitude          + '\n' +
                      'Accuracy: '              + position.coords.accuracy          + '\n' +
                      'Altitude Accuracy: '     + position.coords.altitudeAccuracy  + '\n' +
                      'Heading: '               + position.coords.heading           + '\n' +
                      'Speed: '                 + position.coords.speed             + '\n' +
                      'Timestamp: '             + position.timestamp                + '\n');
            });
        }])
        .controller('authController', ['$scope', 'MbsAPI', function ($scope, MbsAPI) {
            var user = 0;
            var isRegister = false;
            var request = indexedDB.deleteDatabase("mbs");
            initializeStorage(function (db) {
                user = checkUser();
            }, function (e) {
                alert(e.message);
            });

            if (user == 0)
                user = checkUser();

            //if(user != 0)
            //{
               // $scope.authUser();
            //}

            $scope.toggleLoginRegister = function () {
                if(isRegister)
                {
                    $("#mbslogin").removeAttr("style");//css("display", "block");
                    $("#mbsregister").css("display", "none");
                    isRegister = false;
                }else
                {
                    $("#mbslogin").css("display", "none");
                    $("#mbsregister").removeAttr("style");//css("display", "inline");
                    isRegister = true;
                }
            };

            $("#l_email").focusin(function () {
                $scope.hidePopover();
            });
            $("#l_password").focusin(function () {
                $scope.hidePopover();
            });
            $("#inputEmail").keyup(function () {
                $scope.checkUser();
            });
            $("#inputConPassword").keydown(function () {
                $scope.checkPasswords();
            });
            $("#inputConPassword").focusout(function () {
                $scope.checkPasswords();
            });

            $scope.toggleRegFields = function (toggle) {
                $scope.passDisabled = toggle;
                $scope.passConDisabled = toggle;
                $scope.dispNameDisabled = toggle;
                $scope.passQuestDisabled = toggle;
                $scope.passAnsDisabled = toggle;
                $scope.registerDisabled = toggle;
            };
            $scope.hidePopover = function () {
                if (authFailed) {
                    //$("#loginControls input").popover('hide');
                    $("#invalidLogin").css("display", "none");
                }
            };
            $scope.clearFields = function () {
                $("#inputEmail").val("");
                $scope.clearError($("#inputEmail"));
                $("#inputPassword").val("");
                $scope.clearError($("#inputPassword"));
                $("#inputConPassword").val("");
                $scope.clearError($("#inputConPassword"));
                $("#inputDisplayName").val("");
                $scope.clearError($("#inputDisplayName"));
                $("#inputPassQuest").val("");
                $scope.clearError($("#inputPassQuest"));
                $("#inputPassAns").val("");
                $scope.clearError($("#inputPassAns"));
                $scope.toggleRegFields(true);
            };
            $scope.clearError = function (element) {
                $(element).parents('.control-group').removeClass('error');
                $(element).parents('.control-group').removeClass('success');
                $scope.emailErrorText = { visibility: "hidden" };
                $scope.emailStatus = { visibility: "hidden" };
                $scope.passwordErrorText = { visibility: "hidden" };
            };
            $scope.checkPasswords = function () {
                if (!(typeof $scope.regPassword === "undefined") && !(typeof $scope.regConPassword === "undefined") && $scope.regPassword.length > 0 && $scope.regConPassword.length > 0 && !($scope.regPassword === "") && !($scope.regConPassword === "")) {
                    if (!($scope.regPassword === $scope.regConPassword)) {
                        $("#inputConPasswordDiv").removeClass("has-success").addClass("has-error");
                        $("#inputConPasswordLabel").css("display", "inline").text("Passwords do not match!");
                        $("#inputConPasswordSpan").removeClass("glyphicon-ok").addClass("glyphicon-remove");
                    } else {
                        $("#inputConPasswordDiv").removeClass("has-error").addClass("has-success");
                        $("#inputConPasswordLabel").css("display", "none").text("");
                        $("#inputConPasswordSpan").removeClass("glyphicon-remove").addClass("glyphicon-ok");
                    }
                }
            };
            $scope.checkUser = function () {
                if (!(typeof $scope.regUsername === "undefined") && $scope.regUsername.length > 0 && !($scope.regUsername.text === "") && validateEmail($scope.regUsername)) {
                    $("#inputEmailLabel").text("").css("display", "none");

                    $scope.mbsData = MbsAPI.checkUsername({ call: "auth/check/username", userName: $scope.regUsername },
                    function (data) {
                        if (data && data.response.success) {
                            $("#inputEmailDiv").removeClass("has-success");
                            $("#inputEmailDiv").addClass("has-error");
                            $("#inputEmailLabel").text("Username already taken!").css("display", "inline");
                            $("#inputEmailSpan").removeClass("glyphicon-ok");
                            $("#inputEmailSpan").addClass("glyphicon-remove");
                            $scope.toggleRegFields(true);
                        } else {
                            if (data.response.message === "Username Check Succeeded!") {
                                $("#inputEmailDiv").removeClass("has-error");
                                $("#inputEmailDiv").addClass("has-success");
                                $("#inputEmailLabel").text("").css("display", "none");
                                $("#inputEmailSpan").removeClass("glyphicon-remove");
                                $("#inputEmailSpan").addClass("glyphicon-ok");
                                $scope.toggleRegFields(false);
                            }
                        }
                    });
                } else {
                    if (!(typeof $scope.regUsername === "undefined") && $scope.regUsername.length == 0)
                    {
                        $("#inputEmailDiv").removeClass("has-success");
                        $("#inputEmailDiv").removeClass("has-error");
                        $("#inputEmailLabel").text("").css("display", "none");
                        $("#inputEmailSpan").removeClass("glyphicon-remove");
                        $scope.toggleRegFields(true);
                    } else
                    {
                        $("#inputEmailDiv").removeClass("has-success");
                        $("#inputEmailDiv").addClass("has-error");
                        $("#inputEmailLabel").text("Invalid Email!").css("display", "inline");
                        $("#inputEmailSpan").removeClass("glyphicon-ok");
                        $("#inputEmailSpan").addClass("glyphicon-remove");
                        $scope.toggleRegFields(true);
                    }
                   
                }
            };

            $scope.createUser = function () {

                $("#invalidRegistration").css("display", "none");
                $("#invalidUserCreation").css("display", "none");
                //verify all of the information is filled in
                var failed = false;

                if ($("#inputEmail").val() == undefined || $("#inputEmail").val().length == 0)
                    failed = true;
                else
                    if ($("#inputPassword").val() == undefined || $("#inputPassword").val().length == 0)
                        failed = true;
                else
                    if ($("#inputConPassword").val() == undefined || $("#inputConPassword").val().length == 0)
                        failed = true;
                else
                    if ($("#inputDisplayName").val() == undefined || $("#inputDisplayName").val().length == 0)
                        failed = true;
                else
                    if ($("#inputPassQuest").val() == undefined || $("#inputPassQuest").val().length == 0)
                        failed = true;
                else
                    if ($("#inputPassAns").val() == undefined || $("#inputPassAns").val().length == 0)
                        failed = true;

                if (!failed)
                {
                    var accountType = "account_type_customer";

                    $("#accountTypeButtons").find('input:radio').each(function () {
                        if ($(this).prop('checked')) {
                            switch ($(this).val()) {
                                case "Customer": accountType = "account_type_customer"; break;
                                case "Barber": accountType = "account_type_barber"; break;
                                default: accountType = "account_type_customer"; break;
                            }
                        }
                    });

                    $scope.mbsData = MbsAPI.createUser({
                        call: "auth/create", userName: $scope.regUsername, displayName: $scope.regDisplayName,
                        passHash: $scope.regPassword, passQuest: $scope.regPassQuest,
                        passAns: $scope.regPassAns, accountType: accountType
                    },
                    function (data) {
                        if (data && data.response.success) {
                            //show an alert for success
                            //just log the user in?

                            $scope.logUsername = data.admin.username;
                            $scope.logPassword = data.admin.passwordHash;
                            $scope.newUser = true;

                            $scope.authUser();
                        } else {
                            if (data.response.message === "User Creation Failed!") {
                                //handle creation error
                                $("#invalidUserCreation").css("display", "block");
                            }
                        }
                    });
                }else
                    $("#invalidRegistration").css("display", "block");
            };
            $scope.authUser = function () {
                $("#loggingIn").css("display", "block");

                authFailed = false;
 
                if (validateInput($scope.logUsername) && validateInput($scope.logPassword) && validateEmail($scope.logUsername)) {
                    $scope.userAuth = MbsAPI.loginUser({ call: "auth/login", values: $scope.logUsername + "/" + $scope.logPassword },
                    function (data) {
                        if (data && data.response.success) {
                            var profile = data.profile;
 
                            $scope.mbsUsername = $scope.logUsername;
                            $scope.mbsID = profile.userID;
                            $scope.mbsDisplayName = profile.displayName;
                            //$scope.mbsAboutMe = profile.aboutMe;
                            $scope.mbsDateCreated = profile.dateCreated;
                            $scope.mbsProfileStatus = profile.profileStatus.profileStatus;
                            //$scope.mbsProfileType = profile.profileType.profileType;
                            $scope.mbsProfileID = profile.profileID;
                            $scope.mbsAccountType = profile.accountType.accountType;
                            $scope.mbsGalleryID = profile.image.mediaGallery.galleryID;
                            $scope.mbsGalleryName = profile.image.mediaGallery.galleryName;
 
                            //add data to local storage
                            //saveUserData($scope);

                            if (Modernizr.localstorage)
                               setUserData($scope);

                                //if ($("#memory").is(":checked"))
                                    //setCookie("smocookie", $scope.smoID, 365);

                                //redirect the page to set the users session
                            var auth = document.URL;
                            
                            if(getAccountType(profile.accountType.accountType) == "Barber" && ($scope.newUser != undefined ? $scope.newUser : false))                            
                            	getPageView("auth/login.html", "barbersetup.html", null);
                            else
                            	getPageView("auth/login.html", "index.html", null);
                        } else {
                            //auth user failed
                            authFailed = true;
                            //$("#loginControls input").popover('show');
                            $("#invalidLogin").css("display", "block");
                        }
                    });
                } else {
                    //redirect to a different page to track login attempts
                    authFailed = true;
                    $("#invalidLogin").css("display", "block");
                }
            };
            /*$scope.bodyStyle = { height: window.screen.availHeight };
 
             
             //        	jQuery.validator.addMethod("password", function(value, element) 
             //        	{
             //        		var result = this.optional(element) || value.length >= 6 && /\d/.test(value) && /[a-z]/i.test(value);
             //        		if(!result)
             //        		{
             //        			element.value = "";
             //        			var validator = this;
             //        			setTimeout(function() 
             //        			{
             //        				validator.blockFocusCleanup = true;
             //        				element.focus();
             //        				validator.blockFocusCleanup = false;
             //        			}, 1);
             //        		}
             //        		return result;
             //        	}, "Password must be at least 6 characters and contain at least one number and letter.");
             //        	jQuery.validator.messages.required = "";
             //        	var prev = null;
             //        	$("#registrationControls").validate(
             //        	{
             //        		onkeyup:false,
             //        		messages:
             //        		{
             //        			inputConPassword:
             //        			{
             //        				required: " ",
             //        				equalTo:"Passwords do not match!"
             //        			},
             //        			inputEmail:
             //        			{
             //        				required: " ",
             //        				email: "Invalid email!"
             //        			}
             //        		},
             //    			errorClass:"help-inline",
             //    			errorElement:"span",
             //    			highlight:function(element, errorClass, validClass)
             //    			{
             //    				if(prev == null)
             //    				{
             //    					prev = element;
             //    					$(element).parents('.control-group').addClass('error');
             //    				}else
             //    					if(prev != null)
             //    					{
             //    						if(prev != element)
             //    						{
             //    							$(prev).parents('.control-group').removeClass('success');
             //    							$(prev).parents('.control-group').addClass('error');
             //    							prev = null;
             //    						}
             //    						else
             //    						{
             //    							prev = element;
             //    							$(element).parents('.control-group').removeClass('success');
             //    	    					$(element).parents('.control-group').addClass('error');
             //    						}
             //    					}
             //    			},
             //    			unhighlight:function(element, errorClass, validClass)
             //    			{
             //    				$(element).parents('.control-group').removeClass('error');
             //    				$(element).parents('.control-group').addClass('success');
             //    			}
             //        	});
             //        	$("#registrationControls").validate(
             //        	{
             //        		rules:
             //    			{
             //        			inputEmail:
             //        			{
             //        				require:true,
             //        				email:true
             //        			},
             //        			inputPassword: "required",
             ////        			{
             ////        				required:true,
             ////        				minlength:6
             //////        				minlength:"Password must be a minimum of 6 characters",
             //////        				maxlength; p
             ////        			},
             //        			inputConPassword:
             //        			{
             //        				required:true,
             //        				equalTo:"#inputPassword"
             //        			},
             //        			inputPassQuest:
             //        			{
             //        				required:true,
             //        				maxlength:250
             //        			},
             //        			inputPassAns:
             //        			{
             //        				required:true,
             //        				maxlength:250
             //        			}
             //    			},
             //    			messages:
             //    			{
             //    				
             //    			},
             //    			errorClass:"help-inline",
             //    			errorElement:"span",
             //    			highlight:function(element, errorClass, validClass)
             //    			{
             //    				$(element).parents('.control-group').addClass('error');
             //    			},
             //    			unhighlight:function(element, errorClass, validClass)
             //    			{
             //    				$(element).parents('.control-group').removeClass('error');
             //    				$(element).parents('.control-group').addClass('success');
             //    			}
             //        	});
             
             */
        }])
	   .controller('siteController', ['$scope', '$location', 'MbsAPI', 'PlacesAPI', '$routeParams', function ($scope, $location, MbsAPI, PlacesAPI, $routeParams) {
		   var searchObject = $location.search();
		   
		   //gather the users profile information
	       $scope.gatherNearByBarberShops = function () {
	           function initialize() {
	               map = new google.maps.Map(document.getElementById("maps"), {
	                   center: new google.maps.LatLng(38.643517, -77.260843),
	                   zoom: 8
	               });

	               var request = {
	                   location: new google.maps.LatLng(38.643517, -77.260843),
	                   //keyword: 'barber shop',
	                   query: 'barber shop',
	                   //rankBy: google.maps.places.RankBy.DISTANCE,
	                   types: ['hair_care'],
	                   //key: places
	                   radius: 1000
	               };

	               var service = new google.maps.places.PlacesService(map);

	               service.textSearch(request, function (results, status) {
	                   if (status == google.maps.places.PlacesServiceStatus.OK) {
	                       if (results && results.length > 0) {
	                           renderBarberShops(results, $scope);
	                       }
	                   }
	               });
	           }

	           google.maps.event.addDomListener(window, 'load', initialize);
	       }
		   $scope.getUser = function()
		   {
				$scope.userInfo = MbsAPI.getUserProfile({ call: "login/gather", values: $scope.mbsProfileID,
					accountType: getAccountType($scope.mbsAccountType)},
                    function (data) {
                        if (data && data.response.success) {
                            if (!data.barber && !data.barberShop)
                            {
                                $scope.gatherNearByBarberShops();
                            } else
                            {
                                if (data.barber) {
                                	buildBarberProfile(data.barber, $scope)
                                }

                                if (data.barberShop)
                                    buildBarberShop(data.barberShop, $scope);

                                if (data.appointment)
                                    buildAppointments(data.appointment, $scope);

                                $scope.showAppointments();
                                $scope.showBarberShops();
                            }
                        }else
                        {
                            //error getting user data
                        }

                        //removeNotifications();
                        removeLoadingBar();

                        //showNavigation("index");
                    });
		   }
		   $scope.createBarberShop = function (shop) {
		       $scope.shopInfo = MbsAPI.createBarberShop({
		           call: "barbershop/create", values: $scope.mbsProfileID,
		           shopName: shop.name, totalBarbers: 0, owner: "", phoneNumber: shop.phoneNumber,
		           email: "", dateEstablished: "", street: formatAddress(shop.formatted_address, "Street"),
		           city: formatAddress(shop.formatted_address, "City"), stateProvince: formatAddress(shop.formatted_address, "State"),
		           addressType: "address_type_barber_shop", latitude: shop.geometry.location.k, longitude: shop.geometry.location.A,
                   isCustomer: true
		       },
                   function (data) {
                       if (data && data.response.success) {
                           if (data.member) {
                               var userShop = {};

                               userShop.barberShopID = data.member.barberShopID;
                               userShop.createdBy = data.member.createdBy;
                               userShop.dateCreated = data.member.dateCreated;
                               userShop.phoneNumber = data.member.phoneNumber;
                               userShop.shopName = data.member.shopName;
                               userShop.totalBarbers = data.member.totalBarbers;
                               userShop.street = data.member.address.addressLineOne;
                               userShop.city = data.member.address.city;
                               userShop.latitude = data.member.address.latitude;
                               userShop.longitude = data.member.address.longitude;
                               userShop.state = data.member.address.stateProvince;

                               $scope.userShop = userShop;

                               if(Modernizr.localstorage)
                                   setUserShop($scope.userShop);

                               //remove the list of shops and get the barber shop
                               //profile 
                           }
                       }
                   });
		   }
		   $scope.showBarberShops = function()
		   {
		       renderUserBarberShops($scope);
		   }
		   $scope.showAppointments = function ()
		   {
		       renderUserAppointments($scope);
		   }
	       $scope.deleteAppointment = function (appt) {
	    	   
	    	   postStatusMessage("Cancelling Appointment", "info");
	    	   
	           $scope.cancelAppt = MbsAPI.deleteAppointment({
	               call: "appointment/delete", values: $scope.mbsProfileID,
	               appointmentID: appt.appointmentID,
	               appointmentStatus: "Cancelled"
	           },
                   function (data) {
                       if (data && data.response.success) {
                    	   if(data.appointment)
                		   {
	            	   			if($scope.currentAppointments)
            	   				{
	            	   				angular.forEach($scope.currentAppointments, function(appointment, key){
	            	   					if(appointment.appointmentID == data.appointment.appointmentID)
	            	   					{
	            	   						appointment.appointmentStatus = data.appointment.appointmentStatus;
	            	   						appointment.wasCancelled = "true";
	            	   					}
	            	   					
	            	   				});
	                     	   }
	                                
                               updateStatusMessage("Appointment Cancelled", "success");
                		   }
                       } else {
                    	   updateStatusMessage("Couldn't Cancel Appointment", "error");
                       }

                       //showNavigation("search");
                   });
	       }
		   //if(!checkCookie())
	       //clearUserData();
	       //else
	       //{
	       
	       //checkUser();

	       $scope.logOut = function () {
	           //log the user out 
	           clearUserData();
	       };
	      // $scope.bodyStyle = { height: window.screen.availHeight };

	      
	       // $('#fileupload').fileUpload();
	       // Enable iframe cross-domain access via redirect option:
	       //			   $('#fileupload').fileupload(
	       //			       'option',
	       //			       'redirect',
	       //			       window.location.href.replace(
	       //			           /\/[^\/]*$/,
	       //			           '/cors/result.html?%s'
	       //			       )
	       //			   );

	       //getNotification("Loading data", "Loading your information", true, "info");
	       showLoadingBar("Loading your information...");

	       getUserData($scope);
		   
		   $scope.getUser();

	       /*$scope.placesData = PlacesAPI.getBarberShops({location: '38.643517,-77.260843', keyword: 'barber shop',
	           rankby: 'distance', types:'hair_care', sensor: 'false', key: places
	       },
            function (data) {
                if (data && data.results) {

                } else {
                    
                }
            });*/
		   
		   globalScope = $scope;
	   }])
	   .controller('searchController', ['$scope', 'MbsAPI', 'PlacesAPI', function ($scope, MbsAPI, PlacesAPI) {
	       //gather the users profile information
	       $scope.gatherNearByBarberShops = function () {
	    	   showLoadingBar("Loading...");
	           var nearbyBarberShops = [];

	           $scope.nearbyShops = MbsAPI.getNearbyBarberShops({
	               call: "barbershop/gather/nearby", latitude: 38.643517, longitude: -77.260843
	           },
                function (data) {
                    if (data && data.response.success) {
                        if (data.barberShop) {
                            angular.forEach(data.barberShop, function (barberShop, key) {
                                var shop = {};

                                shop.barberShopID = barberShop.barberShopID;
                                shop.createdBy = barberShop.createdBy;
                                shop.dateCreated = barberShop.dateCreated;
                                shop.phoneNumber = barberShop.phoneNumber;
                                shop.shopName = barberShop.shopName;
                                shop.totalBarbers = barberShop.totalBarbers;
                                shop.street = barberShop.address.addressLineOne;
                                shop.city = barberShop.address.city;
                                shop.latitude = barberShop.address.latitude;
                                shop.longitude = barberShop.address.longitude;
                                shop.state = barberShop.address.stateProvince;
                                shop.sunday = barberShop.sunday;
                                shop.monday = barberShop.monday;
                                shop.tuesday = barberShop.tuesday;
                                shop.wednesday = barberShop.wednesday;
                                shop.thursday = barberShop.thursday;
                                shop.friday = barberShop.friday;
                                shop.saturday = barberShop.saturday;

                                nearbyBarberShops.push(shop);
                            });

                            initialize();
                        }
                    }
                });

	           function initialize() {
	               map = new google.maps.Map(document.getElementById("maps"), {
	                   center: new google.maps.LatLng(38.643517, -77.260843),
	                   zoom: 8
	               });

	               var request = {
	                   location: new google.maps.LatLng(38.643517, -77.260843),
	                   //keyword: 'barber shop',
	                   query: 'barber shop',
	                   //rankBy: google.maps.places.RankBy.DISTANCE,
	                   types: ['hair_care'],
	                   //key: places
	                   radius: 1000
	               };

	               var service = new google.maps.places.PlacesService(map);

	               service.textSearch(request, function (results, status) {
	                   if (status == google.maps.places.PlacesServiceStatus.OK) {
	                       if (results && results.length > 0) {
	                           var newResults = [];

	                           if (nearbyBarberShops != null && nearbyBarberShops.length > 0) {
	                               var found = false;

	                               for (var i = 0; i < nearbyBarberShops.length; i++) {
	                                   var nearby = nearbyBarberShops[i];

	                                   for (var j = 0; j < results.length; j++) {
	                                       var goog = results[j];

	                                       if (goog.name != nearby.shopName && goog.geometry.location.k != nearby.latitude
                                              && goog.geometry.location.A != nearby.longitude
                                              && formatAddress(goog.formatted_address, "Street") != nearby.street
                                              && formatAddress(goog.formatted_address, "City") != nearby.city
                                              && formatAddress(goog.formatted_address, "State") != nearby.state) {
	                                           found = false;
	                                       } else {
	                                           found = true;
	                                           break;
	                                       }
	                                   }

	                                   if (!found) {
	                                       newResults.push(goog);
	                                       found = false;
	                                   }
	                               }
	                           } else
	                               newResults = results;

	                           if (nearbyBarberShops != null && nearbyBarberShops.length > 0)
	                               renderNearbyBarberShops(nearbyBarberShops, $scope);

                               renderBarberShops(newResults, $scope);

                    	       $scope.getUser();
	                       }
	                   }
	                   
	                   removeLoadingBar();
	               });
	           }

	           //google.maps.event.addDomListener(window, 'load', initialize);
	       }
	       $scope.getUser = function () {
	           $scope.userInfo = MbsAPI.getUserProfile({
	               call: "login/gather", values: $scope.mbsProfileID,
	               accountType: getAccountType($scope.mbsAccountType)
	           },
                   function (data) {
                       if (data && data.response.success) {
                    	   if(data.barber)
                    		   buildBarberProfile(data.barber, $scope);
                       } else {
                           //error getting user data
                       }

                       //showNavigation("search");
                   });
	       }
	       $scope.createBarberShop = function (shop) {
	           $scope.shopInfo = MbsAPI.createBarberShop({
	               call: "barbershop/create", values: $scope.mbsProfileID,
	               shopName: shop.name, totalBarbers: 0, owner: "", phoneNumber: shop.phoneNumber,
	               email: "", dateEstablished: "", street: formatAddress(shop.formatted_address, "Street"),
	               city: formatAddress(shop.formatted_address, "City"), stateProvince: formatAddress(shop.formatted_address, "State"),
	               addressType: "address_type_barber_shop", latitude: shop.geometry.location.k, longitude: shop.geometry.location.A,
	               isCustomer: true, sunday: shop.sunday != undefined ? shop.sunday : null, monday: shop.monday != undefined ? shop.monday : null,
                   tuesday: shop.tuesday != undefined ? shop.tuesday : null, wednesday: shop.wednesday != undefined ? shop.wednesday : null,
                   thursday: shop.thursday != undefined ? shop.thursday : null, friday: shop.friday != undefined ? shop.friday : null, 
        		   saturday: shop.saturday != undefined ? shop.saturday : null 
	           },
                   function (data) {
                       if (data && data.response.success) {
                           if (data.member) {
                               var userShop = {}; 

                               userShop.barberShopID = data.member.barberShopID;
                               userShop.createdBy = data.member.createdBy;
                               userShop.dateCreated = data.member.dateCreated;
                               userShop.phoneNumber = data.member.phoneNumber;
                               userShop.shopName = data.member.shopName;
                               userShop.totalBarbers = data.member.totalBarbers;
                               userShop.street = data.member.address.addressLineOne;
                               userShop.city = data.member.address.city;
                               userShop.latitude = data.member.address.latitude;
                               userShop.longitude = data.member.address.longitude;
                               userShop.state = data.member.address.stateProvince;
                               userShop.sunday = data.member.sunday;
                               userShop.monday = data.member.monday;
                               userShop.tuesday = data.member.tuesday;
                               userShop.wednesday = data.member.wednesday;
                               userShop.thursday = data.member.thursday;
                               userShop.friday = data.member.friday;
                               userShop.saturday = data.member.saturday;

                               $scope.userShop = userShop;

                               if (Modernizr.localstorage)
                                   setUserShop($scope.userShop);

                               //remove the list of shops and get the barber shop
                               //profile 
                               window.location = document.URL.replace("search", "index");
                           }
                       }
                   });
	       }
	       $scope.createBarberShopCustomer = function (shop) {
	           $scope.customerInfo = MbsAPI.createBarberShop({
	               call: "customer/create", values: $scope.mbsProfileID, barberShopID: shop.barberShopID
	           },
                   function (data) {
                       if (data && data.response.success) {
                           if (data.member) {
                               var userShop = {}; 

                               //remove the list of shops and get the barber shop
                               //profile 
                               window.location = document.URL.replace("search", "index");
                           }
                       }
                   });
	       }
	       $scope.updateBarberInfo = function(){	    	   
	    	   if($scope.barberInfo != null)
	    	   {
		    	   postStatusMessage("Saving barber shop info", "info");
		    	   
		    	   $scope.updateBarberInfo = MbsAPI.updateBarberInfo({
		    		   call: "barber/save/barberinfo", values: $scope.barberInfo.barberID,
		    		   normalTimeIn: $scope.barberInfo.normalTimeIn, yearsOfExperience: $scope.barberInfo.yearsOfExperience,
		    		   avgCutTime: $scope.barberInfo.avgCutTime, acceptsAppointments: $scope.barberInfo.acceptsAppointments,
		    		   profileID: $scope.mbsProfileID, barberShopID: $scope.currentBarber.barberShopID, owner: $scope.currentBarber.isOwner,
		    		   dateCreated: createJavaDate($scope.mbsDateCreated)
		    	   }, 
		    	   	function(data){
		    		   if(data && data.response.success)
	    			   {
		    			   
		    			   updateStatusMessage("Barber info saved successfully", "success");
	                       
	                       getPageView("search.html", "index.html", null); 
	    			   }else	    		   
	    				   updateStatusMessage("Could not save barber info", "error");
		    	   });
	    	   }
	       }

	       getUserData($scope);
	       getBarberData($scope);

	       $scope.gatherNearByBarberShops();
	   }])
	   .controller('barberShopController', ['$scope', 'MbsAPI', 'PlacesAPI', '$routeParams', '$location', function ($scope, MbsAPI, PlacesAPI, $routeParams, $location) {

	       var searchObject = $location.search();
	       
	       $scope.shopImage;
	       $scope.shopAddress; 
	       $scope.shopCityState;
	       
	       $scope.getUser = function () {
	           $scope.userInfo = MbsAPI.getUserProfile({
	               call: "login/gather", values: $scope.mbsProfileID,
	               accountType: getAccountType($scope.mbsAccountType)
	           },
                   function (data) {
                       if (data && data.response.success) {

                       } else {
                           //error getting user data
                       }

                       //showNavigation("search");
                   });
	       }
	       $scope.getBarberShopDetails = function () {
	           $scope.shopInfo = MbsAPI.getBarberShopDetails({
	               call: "barbershop/gather/details", barberShopID: searchObject.barberShopID
	           },
                   function (data) {
                       if (data && data.response.success) {
                           if (data.barberShop) {
                               buildBarberShopDetail(data.barberShop, $scope);

                               $scope.shopImage = getProfileImage($scope.currentBarberShops[0].image, "barberShop");
                               $scope.shopAddress = formatAddressReverse($scope.currentBarberShops[0].address, "Street");
                               $scope.shopCityState = formatAddressReverse($scope.currentBarberShops[0].address, "CityState");
                               $("#hoursOfOperationDiv").append(getHoursOfOperation($scope.currentBarberShops[0].hoursOfOperation))
                               $("#shopSpecialtiesDiv").append(getSpecialties($scope.currentBarberShops[0].barberShopSpecialties));
                               $("#shopBarbers").append(renderBarbers($scope.currentBarberShops[0].barbers));
                               
                               var gallery = renderGallery($scope.currentBarberShops[0].images, "#shopGallery");
                               
                               if(gallery != null)
                            	   $("#shopGallery").append(gallery);
                               
                               $("#shopCustomers").append(renderCustomers($scope.currentBarberShops[0].customers));
                               
                               //renderBarberShopDetails($scope);
                              /* blueimp.Gallery(
                            		    document.getElementById('links').getElementsByTagName('a'),
                            		    {
                            		        container: '#blueimp-gallery',
                            		        carousel: true,
                            		    	fullScreen: true
                            		    }
                            		);*/
                           }
                       }
                   });
	       }

	       getUserData($scope);

	       $scope.getBarberShopDetails();
	   }])
	   .controller('barberController', ['$scope', 'MbsAPI', 'PlacesAPI', '$routeParams', '$location', function ($scope, MbsAPI, PlacesAPI, $routeParams, $location) {

	       var searchObject = $location.search();
	       
	       $scope.barberImage;
	       $scope.isAvailable; 
	       $scope.isAppointments;
	       $scope.isAppointment;
	       $scope.isVacationing;
	       $scope.vacationPeriod;
	       
	       $scope.getUser = function () {
	           $scope.userInfo = MbsAPI.getUserProfile({
	               call: "login/gather", values: $scope.mbsProfileID,
	               accountType: getAccountType($scope.mbsAccountType)
	           },
                   function (data) {
                       if (data && data.response.success) {

                       } else {
                           //error getting user data
                       }

                       //showNavigation("search");
                   });
	       }
	       $scope.getBarberDetails = function () {
	           $scope.shopInfo = MbsAPI.getBarberShopDetails({
	               call: "barber/gather/details", barberID: searchObject.barberID
	           },
                   function (data) {
                       if (data && data.response.success) {
                           if (data.member) {
                               buildBarberProfile(data.member, $scope);

                               $scope.barberImage = getProfileImage($scope.currentBarber.profile.image, "barber");
                               $scope.isAvailable = convertBoolean($scope.currentBarber.barberStatus.isAvailable);
                               $scope.isAppointments = convertBoolean($scope.currentBarber.acceptsAppointments);
                    	       $scope.isAppointment = $scope.currentBarber.acceptsAppointments == "false" ? true : false;
                    	       $scope.isVacationing = convertBoolean($scope.currentBarber.barberStatus.isOnVacation);
                    	       
                    	       if($scope.currentBarber.barberStatus.vacationStartDate && $scope.currentBarber.barberStatus.vacationEndDate)
                        	   {
                    	    	   $scope.vacationPeriod = formatDateNoTime(new Date($scope.currentBarber.barberStatus.vacationStartDate)) + " - " + 
                            	   					formatDateNoTime(new Date($scope.currentBarber.barberStatus.vacationEndDate))
                        	   }
                    	       
                               $("#barberScheduleDiv").append(getHoursOfOperation($scope.currentBarber.barberSchedule));
                               $("#barberSpecialtiesDiv").append(getSpecialties($scope.currentBarber.barberSpecialties));
                               
                               var gallery = renderGallery($scope.currentBarber.barberImages, "#barberGallery");
                               
                               if(gallery != null)
                            	   $("#barberGallery").append(gallery);
                               
                               $("#barberClients").append(renderClients($scope.currentBarber.barberClients));
                                /*$("#shopBarbers").append(renderBarbers($scope.currentBarberShops[0].barbers));
                               
                               //renderBarberShopDetails($scope);
                              /* blueimp.Gallery(
                            		    document.getElementById('links').getElementsByTagName('a'),
                            		    {
                            		        container: '#blueimp-gallery',
                            		        carousel: true,
                            		    	fullScreen: true
                            		    }
                            		);*/
                           }
                       }
                   });
	       }
	       $scope.getAppointmentUrl = function(barberID)
	       {
	       		window.location = document.URL.substring(0, document.URL.indexOf("?")).replace("barber.html", "appointment.html?barberID=" + barberID);
	       }

	       getUserData($scope);

	       $scope.getBarberDetails();
	   }])	   
	   .controller('profileController', ['$scope', 'MbsAPI', 'PlacesAPI', '$routeParams', '$location', function ($scope, MbsAPI, PlacesAPI, $routeParams, $location) {//['$scope', 'SmoAPI', '$timeout', function ($scope, SmoAPI, $timeout) {
		  
		   var searchObject = $location.search();
		   
		   $scope.userImage;
	       $scope.isAvailable; 
	       $scope.isAppointments;
	       $scope.isAppointment;
	       $scope.isVacationing;
	       $scope.vacationPeriod;
	       $scope.memberSince;
		   
		   $scope.getUser = function (profileID) {
			   
			   showLoadingBar("Loading Profile...");
			   
	           $scope.profileInfo = MbsAPI.getUserProfile({
	               call: "profile/gather/details", profileID: searchObject.profileID
	           },
                   function (data) {
                       if (data && data.response.success) {
                    	   buildProfile(data, $scope);
                    	   buildBarberShop(data.barberShop, $scope);
                    	   
                    	   var dateCreated = new Date(Date.parse($scope.currentProfile.dateCreated));
                    	   
                    	   $scope.userImage = getProfileImage($scope.currentProfile.image, "profile");
        	               $scope.memberSince =  getReadableMonth(dateCreated.getMonth()) + " " + dateCreated.getDate() + ", " + 
        	               						 dateCreated.getFullYear();                
                           var gallery = renderGallery($scope.currentProfile.images, "#userGallery");
                           
                           if(gallery != null)
                        	   $("#userGallery").append(gallery);
                           
                           $("#userShops").append(renderUserShops($scope));
                       } else {
                           //error getting user data
                       }

                       //showNavigation("search");
                       
                       removeLoadingBar();
                   });
	       }

	       getUserData($scope);
	       
	       $scope.getUser();
	       /*$scope.logOut = function()
           {
               //log the user out 
               clearUserData();
           };
	       var count = 0, timeoutSet = false, timeoutPromise = null, shouldRemove = false;

	       $scope.bodyStyle = { 'height': window.screen.availHeight, 'background-color': '#ccc' };

	       if (getURLParameters(document.URL).user == $scope.smoProfileID)
	           isUser = true;

	       if (isUser) {//<li role="presentation"><a role="menuitem" tabindex="-1" href="#" onclick="getFileUploader()">Upload</a></li>
	           $('#followGroup').css('display', 'none');
	           $('#profileMenu').append
                                (
                                   $('<li/>').attr('role', 'presentation')
                                             .append
                                             (
                                                $('<a/>').attr(
                                                         {
                                                             'role': 'menuitem',
                                                             'tabindex': '-1',
                                                             'href': '#',
                                                             'onclick': 'getFileUploader()'
                                                         }).append('Edit')
                                             )
                                );
	       }*/
	   }])	   
	   .controller('barberSetupController', ['$rootScope', '$scope', 'MbsAPI', 'PlacesAPI', '$routeParams', '$location', function ($rootScope, $scope, MbsAPI, PlacesAPI, $routeParams, $location) {//['$scope', 'SmoAPI', '$timeout', function ($scope, SmoAPI, $timeout) {
		  
		   var searchObject = $location.search();	       
	       var scheduling = {};
	       var barberSpecialties = {}; 
	       var barberInfo = {};
		   
		   $scope.apptTimes = {};
	       $scope.isAvailable; 
	       $scope.isAppointments;
	       $scope.isAppointment;
	       $scope.isVacationing;
	       $scope.vacationPeriod;
	       $scope.memberSince;
		   
	       $scope.getUser = function () {
	           $scope.userInfo = MbsAPI.getUserProfile({
	               call: "login/gather", values: $scope.mbsProfileID,
	               accountType: getAccountType($scope.mbsAccountType)
	           },
                   function (data) {
                       if (data && data.response.success) {
                    	   	$location.search("barberID", data.barber.barberID);
                    	   	searchObject = $location.search();
                       } else {
                           //error getting user data
                       }

                       //showNavigation("search");
            	       $scope.getBarberDetails();
                   });
	       }
	       $scope.getBarberDetails = function () {
	           $scope.shopInfo = MbsAPI.getBarberShopDetails({
	               call: "barber/gather/details", barberID: searchObject.barberID
	           },
                   function (data) {
                       if (data && data.response.success) {
                           if (data.member) {
                               buildBarberProfile(data.member, $scope);

                               /*$scope.barberImage = getProfileImage($scope.currentBarber.profile.image, "barber");
                               $scope.isAvailable = convertBoolean($scope.currentBarber.barberStatus.isAvailable);
                               $scope.isAppointments = convertBoolean($scope.currentBarber.acceptsAppointments);
                    	       $scope.isAppointment = $scope.currentBarber.acceptsAppointments == "false" ? true : false;
                    	       $scope.isVacationing = convertBoolean($scope.currentBarber.barberStatus.isOnVacation);
                    	       
                    	       if($scope.currentBarber.barberStatus.vacationStartDate && $scope.currentBarber.barberStatus.vacationEndDate)
                        	   {
                    	    	   $scope.vacationPeriod = formatDateNoTime(new Date($scope.currentBarber.barberStatus.vacationStartDate)) + " - " + 
                            	   					formatDateNoTime(new Date($scope.currentBarber.barberStatus.vacationEndDate))
                        	   }
                    	       
                               $("#barberScheduleDiv").append(getHoursOfOperation($scope.currentBarber.barberSchedule));
                               $("#barberSpecialtiesDiv").append(getSpecialties($scope.currentBarber.barberSpecialties));
                               
                               var gallery = renderGallery($scope.currentBarber.barberImages, "#barberGallery");
                               
                               if(gallery != null)
                            	   $("#barberGallery").append(gallery);
                               
                               $("#barberClients").append(renderClients($scope.currentBarber.barberClients));
                                /*$("#shopBarbers").append(renderBarbers($scope.currentBarberShops[0].barbers));
                               
                               //renderBarberShopDetails($scope);
                              /* blueimp.Gallery(
                            		    document.getElementById('links').getElementsByTagName('a'),
                            		    {
                            		        container: '#blueimp-gallery',
                            		        carousel: true,
                            		    	fullScreen: true
                            		    }
                            		);*/
                           }
                       }
                   });
	       }
	       $scope.saveBarberSchedule = function()
	       {
	    	   postStatusMessage("Saving schedule", "info");
	    	   
	    	   var days = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "freetime"];
	    	   var err = "Please select hours for these days: ";
	    	   var hasError = false;
	    	   
	    	   angular.forEach(days, function(day, key){
	    		   if(!scheduling[day])
    			   {
	    			   err += day.charAt(0).toUpperCase() + day.substring(1) + " ";
	    			   hasError = true;
    			   }
	    	   });
	    	   
	    	   if(hasError)
    		   {
	    		   alert(err);
	    		   hasError = false;
    		   }
	    	   
	    	   //validate schedule input
	    	   err = "Please select hours for these days: "
	    	   var tooLarge = "Time Out must be greater than Time In for:" 
	    	   var hasBlankTime = false, isTooLarge = false;
	    	   
	    	   angular.forEach(scheduling, function(day, key){
	    		   var time = day.split("-");
	    		   
	    		   if(time[0].trim() == "Time In" || time[0] == " " || time[1].trim() == "Time Out" || time[1] == " ")
    			   {
	    			   err += key.charAt(0).toUpperCase() + key.substring(1) + " ";
	    			   hasBlankTime = true;
	    			   hasError = true;
    			   }else
    				   if(decodeTime(time[1]) <= decodeTime(time[0]))
					   {
    					   tooLarge += key.charAt(0).toUpperCase() + key.substring(1) + " ";  
    					   isTooLarge = true;  					   
    					   hasError = true;
					   }
	    	   });
	    	   
	    	   if(hasError)
    		   {
	    		   if(hasBlankTime && isTooLarge)
	    			   updateStatusMessage(err + "\n" + tooLarge, "error");
	    		   else
	    			   if(hasBlankTime)
	    				   updateStatusMessage(err, "error");
	    			   else
	    				   if(isTooLarge)
	    					   updateStatusMessage(tooLarge, "error");
	    		   
	    		   hasError = false;
    		   }else
			   {
    			   if($scope.currentBarber == null || $scope.currentBarber == undefined)
    				   $scope.getBarberDetails();
    			   
    			   $scope.scheduleInfo = MbsAPI.createBarberSchedule({
    	               call: "barber/schedule/create", values: searchObject.barberID,
    	               sunday: checkTime(scheduling.sunday), monday: checkTime(scheduling.monday), tuesday: checkTime(scheduling.tuesday),
    	               wednesday: checkTime(scheduling.wednesday), thursday: checkTime(scheduling.thursday), friday: checkTime(scheduling.friday),
    	               saturday: checkTime(scheduling.saturday), blackOutTime: checkTime(scheduling.freetime), profileID: $scope.mbsProfileID
    	           },
                       function (data) {
                           if (data && data.response.success) {
                               if (data.member) {
                                   $scope.currentBarber.barberSchedule = data.member;
                                   
                                   updateStatusMessage("Schedule saved successfully", "success");
                                   
                                   $("#barberScheduleDiv").css("display", "none");
                                   $("#barberSpecialtiesDivContainer").css("display", "block");
                                   
                                   showLoadingBar("Loading specialties...");                                  
                                   
                        	       $scope.getSpecialties();
                               }
                           }else
                    	   {
                        	   updateStatusMessage("Could not save schedule", "error");
                    	   }
                       });
			   }
	       }
	       $scope.saveBarberSpecialties = function()
	       {
	    	   postStatusMessage("Saving specialties", "info")
	    	   var _specialties = "";
	    		   
    		   if(barberSpecialties)
			   {
    			   angular.forEach(barberSpecialties, function(specialty, key){
    				   if(specialty != null)    					   
    					   _specialties = _specialties == "" ? specialty : _specialties + "," + specialty;
    			   });
			   }
	    		   
	    	   if(_specialties != "")
    		   {
		    	   $scope.specialtiesInfo = MbsAPI.createBarberSpecialties({
		               call: "specialties/create/barber", values: searchObject.barberID,
		               specialties: _specialties
		           },
	               function (data) {
	                   if (data && data.response.success) {
	                       if (data.specialties) {	                    	   
	                    	   if(barberSpecialties)
	            			   {
	                			   angular.forEach(barberSpecialties, function(specialty, key){
	                				   angular.forEach(data.specialties, function(barberSpecialty, skey){
		                				   if(specialty != null && barberSpecialty != null)    					   
	                					   {
		                					   if(specialty == barberSpecialty.specialtyID)
		                						   barberSpecialty["specialty"] = key;
	                					   }	                					   
	                				   });
	                			   });
	            			   }
	                    	   
	                           $scope.currentBarber.barberSpecialties = data.specialties;
	                           
	                           updateStatusMessage("Specialties saved successfully", "success");
	                           
	                           setBarberData(barberInfo);
	                           
	                           getPageView("barbersetup.html", "search.html", null); 
	                       }
	                   }else
	            	   {
	                	   updateStatusMessage("Could not save specialties", "error");
	            	   }
	               });
    		   }else
			   {
    			   updateStatusMessage("Please select at least one specialty", "error");
			   }
	       }
	       $scope.getSpecialties = function(){
	    	   $scope.specialties = MbsAPI.getSpecialties({
	    		   call: "specialties/gather"
	    	   }, 
	    	   	function(data){
	    		   if(data && data.response.success)
    			   {
	    			   if(data.specialties)
    				   {
	    				   $scope.specialties = [];
	    				   
	    				   angular.forEach(data.specialties, function(specialty, key){
	    					   $scope.specialties.push(specialty);
	    					   
	    					   $("#barberSpecialtiesDiv").prepend(
    							   	$("<input>").prop("type", "checkbox")
    							   				.prop("name", specialty.specialty)
    							   				.prop("value", specialty.specialtyID)
    							   				.css({
    							   					"width": "24px",
    							   					"height": "24px"
    							   				})
    							   				.addClass("specialties")
    							   				.click(function(){    							   					
    							   					if($(this).is(":checked")) {
    							   						barberSpecialties[$(this).prop("name")] = $(this).val();
      							   			        }else
      							   			        	barberSpecialties[$(this).prop("name")] = null;
			    							   	}),    							   				
			   						$("<label/>").css("color", "white")
			   									 .text(specialty.specialty),
			   						$("<br/>")
	    					   )
	    				   });
    				   }
    			   }
	    		   
	    		   removeLoadingBar();
	    	   });
	       }
	       $scope.saveBarberInfo = function(){
	    	   
	    	   postStatusMessage("Saving barber info", "info");
	    	   
	    	   barberInfo.acceptsAppointments = $("#acceptAppt").is(":checked");
	    	   barberInfo.barberID = searchObject.barberID;
	    	   
	    	   updateStatusMessage("Barber info saved successfully", "success");
	    	   
	    	   $("#barberDiv").css("display", "none");
	    	   $("#barberScheduleDiv").css("display", "block");
	       }
	       
	       function checkTime(time)
	       {
	    	   time = time.split("-");
	    	   
	    	   if(time[0].trim() == "OFF" && time[1].trim() == "OFF")
	    		   return "OFF";
	    	   
	    	   return time;
	       }
	       
	       function addSpecialty()
	       {
	    	   var ul = $("<ul/>").addClass("dropdown-menu specialties")
	   				   			 .attr("value", "")
	   				   			 .attr("role", "menu")
	   				   			 .css({
	   				   				 "width": "100%",
	   				   				 "height": "20em",
   				   					 "overflow": "auto",
   				   					 "overflow-x": "hidden"
	   				   			 });
	    	   
	    	   angular.forEach($scope.specialties, function(specialty, key){
	    		   ul.append(
    				   $("<li/>").append(
						   $("<a/>").prop("href", "#").text(specialty.specialty)
    				   )
	    		   ) 
	    	   });
	    	   
	    	   $("#barberSpecialtiesDiv").append(
    			   $("<div/>").addClass("row-fluid").append(
	    			   $("<div/>").addClass("btn-group").append(
						   $("<button/>").addClass("btn btn-inverse dropdown-toggle")
						   				 .attr("data-toggle", "dropdown")
						   				 .prop("value", "Specialty")
						   				 .text("Specialty")
						   				 .append(
					   						 $("<span/>").addClass("caret")
						   				 ),
		   				   ul
	    			   ),
	    			   $("<button/>").addClass("btn btn-inverse")
	    			   				 .append("Add")
    			   )
			   )
	       }

	       getUserData($scope);
	       
	       getDefaultApptTimes($scope);
	       
	       $scope.yearsOfExperience = ["1", "2", "3", "4", "5", "5+"];
	       $scope.avgCutTime = ["5", "10", "15", "20", "25"];
	       
	       if($scope.apptTimes)
    	   {
	    	   angular.forEach($scope.apptTimes, function(time, key){
	    		  $(".normalTimeIn").append(
	    				  $("<li/>").append(
	    						  $("<a/>").prop("href", "#").text(time)
						  )
				  ) 
	    	   });
			  
	    	   $scope.apptTimes["00:00 AM"] = "OFF";
	    	   
	    	   angular.forEach($scope.apptTimes, function(time, key){
	    		  $(".barberhours").append(
	    				  $("<li/>").append(
	    						  $("<a/>").prop("href", "#").text(time)
						  )
				  ) 
	    	   });
    	   }
	       
	       angular.forEach($scope.yearsOfExperience, function(exp, key){
	    		  $(".yearsOfExperience").append(
	    				  $("<li/>").append(
	    						  $("<a/>").prop("href", "#").text(exp)
						  )
				  ) 
	    	   });
	       
	       angular.forEach($scope.avgCutTime, function(time, key){
	    		  $(".avgCutTime").append(
	    				  $("<li/>").append(
	    						  $("<a/>").prop("href", "#").text(time)
						  )
				  ) 
	    	   });
	       
	       $scope.getUser();
	       
	       $rootScope.toggle("barberScheduleOverlay", "on");
	       
	       $(".barberhours li a").click(function()
		   {    		
	    	  var time; 
	    	  var pDiv;
	    	  
	    	  if($(this).parent().parent().prev().val().trim() == "Time In")
    		  {
	    		 if($(this).text().trim() == "OFF") 
	    		 {
	    			 pDiv =  $(this).parent().parent().prev().parent().nextAll("div"); 
	    		 
	    			 $(pDiv[0]).children("button").text("OFF");
	    		 }else
					  if($($(this).parent().parent().prev().parent().nextAll("div")[0]).children("button").text() == "OFF")
					  {
						  $($(this).parent().parent().prev().parent().nextAll("div")[0]).children("button").text("Time Out")
					  }
		    	  
				 if(scheduling[$(this).parent().parent().attr("value").toLowerCase()])
				 {
					 time = scheduling[$(this).parent().parent().attr("value").toLowerCase()].split("-");
					 
					 scheduling[$(this).parent().parent().attr("value").toLowerCase()] = $(this).text() == 'OFF' ? ("OFF - OFF") : (($(this).text() + " - ") + (time[1].trim() == "OFF" ? "Time Out" : time[1].trim()));
				 }
				 else
					 scheduling[$(this).parent().parent().attr("value").toLowerCase()] = $(this).text() == 'OFF' ? ("OFF - OFF") : ($(this).text() + " - ");
    		  }else
    			  if($(this).parent().parent().prev().val().trim() == "Time Out")
        		  {
    				  if($(this).text().trim() == "OFF")
    				  {
    					  pDiv =  $(this).parent().parent().prev().parent().prevAll("div"); 
    					  
    					  $(pDiv[0]).children("button").text("OFF");
    				  }else
    					  if($($(this).parent().parent().prev().parent().prevAll("div")[0]).children("button").text() == "OFF")
						  {
    						  $($(this).parent().parent().prev().parent().prevAll("div")[0]).children("button").text("Time In")
						  }
    		    	  
    	    		 if(scheduling[$(this).parent().parent().attr("value").toLowerCase()])
    				 {
    					 time = scheduling[$(this).parent().parent().attr("value").toLowerCase()].split("-");
    					 
    					 scheduling[$(this).parent().parent().attr("value").toLowerCase()] = $(this).text() == 'OFF' ? ("OFF - OFF") : ((time[0].trim() == "OFF" ? "Time In" : time[0].trim()) + " - " + $(this).text());
    				 }
    				 else
    					 scheduling[$(this).parent().parent().attr("value").toLowerCase()] = $(this).text() == 'OFF' ? ("OFF - OFF") : (" - " + $(this).text());
        		  }
	    	  
			  $(this).parent().parent().prev().text($(this).text());
	       });
	       $(".specialties").change(function(){
	    	   alert($(this).val());
	       });
	       $(".normalTimeIn li a").click(function()
		   {    		
	    	   barberInfo.normalTimeIn = $(this).text();
	    	  
			   $(this).parent().parent().prev().text($(this).text());
	       });
	       $(".yearsOfExperience li a").click(function()
		   {    		
	    	   barberInfo.yearsOfExperience = $(this).text();
	    	  
			   $(this).parent().parent().prev().text($(this).text());
	       });
	       $(".avgCutTime li a").click(function()
		   {    		
	    	   barberInfo.avgCutTime = $(this).text();
	    	  
			   $(this).parent().parent().prev().text($(this).text());
	       });
	   }])
	   .controller('barberProfileController', ['$rootScope', '$scope', 'MbsAPI', 'PlacesAPI', '$routeParams', '$location', function ($rootScope, $scope, MbsAPI, PlacesAPI, $routeParams, $location) {//['$scope', 'SmoAPI', '$timeout', function ($scope, SmoAPI, $timeout) {
		  
		   var searchObject = $location.search();	       
	       var scheduling = {};
	       var barberSpecialties = {}; 
	       var barberInfo = {};
		   
		   $scope.apptTimes = {};
	       $scope.isAvailable; 
	       $scope.isAppointments;
	       $scope.isAppointment;
	       $scope.isVacationing;
	       $scope.vacationPeriod;
	       $scope.memberSince;
		   
	       $scope.getUser = function () {
	    	   
	    	   showLoadingBar("Loading barber profile...");
	    	   
	           $scope.userInfo = MbsAPI.getUserProfile({
	               call: "login/gather", values: $scope.mbsProfileID,
	               accountType: getAccountType($scope.mbsAccountType)
	           },
                   function (data) {
                       if (data && data.response.success) {
                    	   
                    	   if(!searchObject.barberID)
                		   {
	                    	   	$location.search("barberID", data.barber.barberID);
	                    	   	searchObject = $location.search();
                		   }
                       } else {
                           //error getting user data
                       }

                       //showNavigation("search");
                       $scope.getBarberDetails();
                   });
	       }
	       $scope.getBarberDetails = function () {
	           $scope.shopInfo = MbsAPI.getBarberShopDetails({
	               call: "barber/gather/details", barberID: searchObject.barberID
	           },
                   function (data) {
                       if (data && data.response.success) {
                           if (data.member) {
                               buildBarberProfile(data.member, $scope);
                               
                               $scope.currentBarber.acceptsAppointmentsFlag = convertBoolean($scope.currentBarber.acceptsAppointments);
                           }
                       }
                       
                       removeLoadingBar();
                   });
	       }
	       $scope.editBarberInfo = function(){
	    	   if($scope.currentBarber)
    		   {
	    		   $("#barberInfoStatic").css("display", "none");
	    		   $("#barberInfoEdit").css("display", "block");
	    		   
		    	   $(".normalTimeIn li a").parent().parent().prev().text($scope.currentBarber.normalTimeIn);
		    	   barberInfo.normalTimeIn = $scope.currentBarber.normalTimeIn;
		    	   $(".yearsOfExperience li a").parent().parent().prev().text($scope.currentBarber.yearsOfExperience);
		    	   barberInfo.yearsOfExperience = $scope.currentBarber.yearsOfExperience;
		    	   $(".avgCutTime li a").parent().parent().prev().text($scope.currentBarber.avgCutTime);
		    	   barberInfo.avgCutTime = $scope.currentBarber.avgCutTime;
		    	   $("#acceptAppt").attr("checked", $scope.currentBarber.acceptsAppointments);
		    	   barberInfo.acceptsAppointments = $scope.currentBarber.acceptsAppointments;
    		   }
	       }
	       $scope.cancelEditBarberInfo = function(){
	    	   $("#barberInfoStatic").css("display", "block");
	    	   $("#barberInfoEdit").css("display", "none");
	       }
	       $scope.updateBarberInfo = function(){	    	  
	    	   postStatusMessage("Saving barber info", "info");
	    	   
	    	   $scope.updateBarberInfo = MbsAPI.updateBarberInfo({
	    		   call: "barber/save/barberinfo", values: searchObject.barberID,
	    		   normalTimeIn: barberInfo.normalTimeIn, yearsOfExperience: barberInfo.yearsOfExperience,
	    		   avgCutTime: barberInfo.avgCutTime, acceptsAppointments: $("#acceptAppt").is(":checked"),
	    		   profileID: $scope.mbsProfileID, barberShopID: $scope.currentBarber.barberShopID, owner: $scope.currentBarber.isOwner,
	    		   dateCreated: createJavaDate($scope.mbsDateCreated)
	    	   }, 
	    	   	function(data){
	    		   if(data && data.response.success)
    			   {	    			   
	    			   updateStatusMessage("Barber info saved successfully", "success");
	    			   
	    			   $scope.currentBarber.normalTimeIn = barberInfo.normalTimeIn;
	    			   $scope.currentBarber.yearsOfExperience = barberInfo.yearsOfExperience;
	    			   $scope.currentBarber.avgCutTime = barberInfo.avgCutTime;
	    			   $scope.currentBarber.acceptsAppointments = $("#acceptAppt").is(":checked");
	    			   $scope.currentBarber.acceptsAppointmentsFlag = convertBoolean($scope.currentBarber.acceptsAppointments);
                       
                       $scope.cancelEditBarberInfo();
    			   }else	    		   
    				   updateStatusMessage("Could not save barber info", "error");
	    	   });
	       }
	       $scope.editBarberSchedule = function(){
	    	   if($scope.currentBarber)
    		   {
	    		   $("#barberScheduleStatic").css("display", "none");
	    		   $("#barberScheduleEdit").css("display", "block");
	    		   
	    		   var hours = [];
	    		   
	    		   hours = $scope.currentBarber.barberSchedule.sunday.split("-");
	    		   
		    	   $(".sundayIn li a").parent().parent().prev().text(hours[0].trim() == "OFF" ? "OFF" : hours[0].trim());
		    	   $(".sundayOut li a").parent().parent().prev().text(hours[0].trim() == "OFF" ? "OFF" : hours[1].trim());
		    	   scheduling["sunday"] = hours[0].trim() == "OFF" ? "OFF - OFF" : hours[0].trim() + " - " + hours[1].trim();
	    		   hours = $scope.currentBarber.barberSchedule.monday.split("-");
		    	   $(".mondayIn li a").parent().parent().prev().text(hours[0].trim() == "OFF" ? "OFF" : hours[0].trim());
		    	   $(".mondayOut li a").parent().parent().prev().text(hours[0].trim() == "OFF" ? "OFF" : hours[1].trim());
		    	   scheduling["monday"] = hours[0].trim() == "OFF" ? "OFF - OFF" : hours[0].trim() + " - " + hours[1].trim();
	    		   hours = $scope.currentBarber.barberSchedule.tuesday.split("-");
		    	   $(".tuesdayIn li a").parent().parent().prev().text(hours[0].trim() == "OFF" ? "OFF" : hours[0].trim());
		    	   $(".tuesdayOut li a").parent().parent().prev().text(hours[0].trim() == "OFF" ? "OFF" : hours[1].trim());
		    	   scheduling["tuesday"] = hours[0].trim() == "OFF" ? "OFF - OFF" : hours[0].trim() + " - " + hours[1].trim();
	    		   hours = $scope.currentBarber.barberSchedule.wednesday.split("-");
		    	   $(".wednesdayIn li a").parent().parent().prev().text(hours[0].trim() == "OFF" ? "OFF" : hours[0].trim());
		    	   $(".wednesdayOut li a").parent().parent().prev().text(hours[0].trim() == "OFF" ? "OFF" : hours[1].trim());
		    	   scheduling["wednesday"] = hours[0].trim() == "OFF" ? "OFF - OFF" : hours[0].trim() + " - " + hours[1].trim();
	    		   hours = $scope.currentBarber.barberSchedule.thursday.split("-");
		    	   $(".thursdayIn li a").parent().parent().prev().text(hours[0].trim() == "OFF" ? "OFF" : hours[0].trim());
		    	   $(".thursdayOut li a").parent().parent().prev().text(hours[0].trim() == "OFF" ? "OFF" : hours[1].trim());
		    	   scheduling["thursday"] = hours[0].trim() == "OFF" ? "OFF - OFF" : hours[0].trim() + " - " + hours[1].trim();
	    		   hours = $scope.currentBarber.barberSchedule.friday.split("-");
		    	   $(".fridayIn li a").parent().parent().prev().text(hours[0].trim() == "OFF" ? "OFF" : hours[0].trim());
		    	   $(".fridayOut li a").parent().parent().prev().text(hours[0].trim() == "OFF" ? "OFF" : hours[1].trim());
		    	   scheduling["friday"] = hours[0].trim() == "OFF" ? "OFF - OFF" : hours[0].trim() + " - " + hours[1].trim();
	    		   hours = $scope.currentBarber.barberSchedule.saturday.split("-");
		    	   $(".saturdayIn li a").parent().parent().prev().text(hours[0].trim() == "OFF" ? "OFF" : hours[0].trim());
		    	   $(".saturdayOut li a").parent().parent().prev().text(hours[0].trim() == "OFF" ? "OFF" : hours[1].trim());
		    	   scheduling["saturday"] = hours[0].trim() == "OFF" ? "OFF - OFF" : hours[0].trim() + " - " + hours[1].trim();
	    		   hours = $scope.currentBarber.barberSchedule.blackOutTime.split("-");
		    	   $(".freeTimeIn li a").parent().parent().prev().text(hours[0].trim() == "OFF" ? "OFF" : hours[0].trim());
		    	   $(".freeTimeOut li a").parent().parent().prev().text(hours[0].trim() == "OFF" ? "OFF" : hours[1].trim());
		    	   scheduling["freetime"] = hours[0].trim() == "OFF" ? "OFF - OFF" : hours[0].trim() + " - " + hours[1].trim();
    		   }
	       }
	       $scope.cancelEditBarberSchedule = function(){
	    	   $("#barberScheduleStatic").css("display", "block");
	    	   $("#barberScheduleEdit").css("display", "none");
	       }
	       $scope.saveBarberSchedule = function()
	       {
	    	   postStatusMessage("Saving schedule", "info");
	    	   
	    	   var days = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "freetime"];
	    	   var err = "Please select hours for these days: ";
	    	   var hasError = false;
	    	   
	    	   angular.forEach(days, function(day, key){
	    		   if(!scheduling[day])
    			   {
	    			   err += day.charAt(0).toUpperCase() + day.substring(1) + " ";
	    			   hasError = true;
    			   }
	    	   });
	    	   
	    	   if(hasError)
    		   {
	    		   alert(err);
	    		   hasError = false;
    		   }
	    	   
	    	   //validate schedule input
	    	   err = "Please select hours for these days: "
	    	   var tooLarge = "Time Out must be greater than Time In for:" 
	    	   var hasBlankTime = false, isTooLarge = false;
	    	   
	    	   angular.forEach(scheduling, function(day, key){
	    		   var time = day.split("-");
	    		   
	    		   if(time[0].trim() == "Time In" || time[0] == " " || time[1].trim() == "Time Out" || time[1] == " ")
    			   {
	    			   err += key.charAt(0).toUpperCase() + key.substring(1) + " ";
	    			   hasBlankTime = true;
	    			   hasError = true;
    			   }else
    				   if(decodeTime(time[1]) <= decodeTime(time[0]))
					   {
    					   tooLarge += key.charAt(0).toUpperCase() + key.substring(1) + " ";  
    					   isTooLarge = true;  					   
    					   hasError = true;
					   }
	    	   });
	    	   
	    	   if(hasError)
    		   {
	    		   if(hasBlankTime && isTooLarge)
	    			   updateStatusMessage(err + "\n" + tooLarge, "error");
	    		   else
	    			   if(hasBlankTime)
	    				   updateStatusMessage(err, "error");
	    			   else
	    				   if(isTooLarge)
	    					   updateStatusMessage(tooLarge, "error");
	    		   
	    		   hasError = false;
    		   }else
			   {
    			   if($scope.currentBarber == null || $scope.currentBarber == undefined)
    				   $scope.getBarberDetails();
    			   
    			   $scope.scheduleInfo = MbsAPI.updateBarberSchedule({
    	               call: "barber/schedule/update", values: searchObject.barberID,
    	               sunday: checkTime(scheduling.sunday), monday: checkTime(scheduling.monday), tuesday: checkTime(scheduling.tuesday),
    	               wednesday: checkTime(scheduling.wednesday), thursday: checkTime(scheduling.thursday), friday: checkTime(scheduling.friday),
    	               saturday: checkTime(scheduling.saturday), blackOutTime: checkTime(scheduling.freetime), profileID: $scope.mbsProfileID,
    	               barberScheduleID: $scope.currentBarber.barberSchedule.barberScheduleID
    	           },
                       function (data) {
                           if (data && data.response.success) {
                               if (data.member) {
                                  $scope.currentBarber.barberSchedule = data.member;
                                   
                                  updateStatusMessage("Schedule saved successfully", "success");
                                   
                                  $scope.cancelEditBarberSchedule();
                               }
                           }else
                    	   {
                        	   updateStatusMessage("Could not save schedule", "error");
                    	   }
                       });
			   }
	       }
	       $scope.editBarberSpecialties = function(){ 
	    	   $("#barberSpecialtiesStatic").css("display", "none");
    		   $("#barberSpecialtiesEdit").css("display", "block");
    		   
    		   showLoadingBar("Loading specialties...");
    		   
    		   $scope.getSpecialties();
	       }
	       $scope.cancelEditBarberSpecialties = function(){
	    	   $("#barberSpecialtiesStatic").css("display", "block");
	    	   $("#barberSpecialtiesEdit").css("display", "none");
	       }
	       $scope.saveBarberSpecialties = function()
	       {
	    	   postStatusMessage("Saving specialties", "info")
	    	   var _specialties = "";
	    		   
    		   if(barberSpecialties)
			   {
    			   angular.forEach(barberSpecialties, function(specialty, key){
    				   if(specialty != null)    					   
    					   _specialties = _specialties == "" ? specialty : _specialties + "," + specialty;
    			   });
			   }
	    		   
	    	   if(_specialties != "")
    		   {
		    	   $scope.specialtiesInfo = MbsAPI.createBarberSpecialties({
		               call: "specialties/update/barber", values: searchObject.barberID,
		               specialties: _specialties
		           },
	               function (data) {
	                   if (data && data.response.success) {
	                       if (data.specialties) {	                    	   
	                    	   if(barberSpecialties)
	            			   {
	                			   angular.forEach(barberSpecialties, function(specialty, key){
	                				   angular.forEach(data.specialties, function(barberSpecialty, skey){
		                				   if(specialty != null && barberSpecialty != null)    					   
	                					   {
		                					   if(specialty == barberSpecialty.specialtyID)
		                						   barberSpecialty["specialty"] = key;
	                					   }	                					   
	                				   });
	                			   });
	            			   }
	                    	   
	                           $scope.currentBarber.barberSpecialties = data.specialties;
	                           
	                           updateStatusMessage("Specialties saved successfully", "success");
	                           
	                           $scope.cancelEditBarberSpecialties();
	                       }
	                   }else
	            	   {
	                	   updateStatusMessage("Could not save specialties", "error");
	            	   }
	               });
    		   }else
			   {
    			   updateStatusMessage("Please select at least one specialty", "error");
			   }
	       }
	       $scope.getSpecialties = function(){
	    	   $scope.specialties = MbsAPI.getSpecialties({
	    		   call: "specialties/gather"
	    	   }, 
	    	   	function(data){
	    		   if(data && data.response.success)
    			   {
	    			   if(data.specialties)
    				   {
	    				   $(".specialties").remove();
	    				   $(".specialtyLabel").remove();
	    				   $(".specialtyBreak").remove();
	    				   $scope.specialties = [];
	    				   $scope.userSpecialties = [];
	    				   
	    				   angular.forEach($scope.currentBarber.barberSpecialties, function(specialty, key){
	    					  $scope.userSpecialties.push(specialty.specialty); 
	    					  barberSpecialties[specialty.specialty] = specialty.specialtyID;
	    				   });
	    				   
	    				   angular.forEach(data.specialties, function(specialty, key){
	    					   $scope.specialties.push(specialty);
	    					   
	    					   $("#barberSpecialtiesEdit").prepend(
    							   	$("<input>").prop("type", "checkbox")
    							   				.prop("name", specialty.specialty)
    							   				.prop("value", specialty.specialtyID)
    							   				.attr("checked", $scope.userSpecialties.indexOf(specialty.specialty) > -1 ? true : false)
    							   				.css({
    							   					"width": "24px",
    							   					"height": "24px"
    							   				})
    							   				.addClass("specialties")
    							   				.click(function(){    							   					
    							   					if($(this).is(":checked")) {
    							   						barberSpecialties[$(this).prop("name")] = $(this).val();
      							   			        }else
      							   			        	barberSpecialties[$(this).prop("name")] = null;
			    							   	}),    							   				
			   						$("<label/>").css("color", "white")
			   									 .text(specialty.specialty)
    							   				 .addClass("specialtyLabel"),
			   						$("<br/>").addClass("specialtyBreak")
	    					   )
	    				   });
    				   }
    			   }
	    		   
	    		   removeLoadingBar();
	    	   });
	       }
	       
	       function checkTime(time)
	       {
	    	   time = time.split("-");
	    	   
	    	   if(time[0].trim() == "OFF" && time[1].trim() == "OFF")
	    		   return "OFF";
	    	   
	    	   return time;
	       }
	       
	       function addSpecialty()
	       {
	    	   var ul = $("<ul/>").addClass("dropdown-menu specialties")
	   				   			 .attr("value", "")
	   				   			 .attr("role", "menu")
	   				   			 .css({
	   				   				 "width": "100%",
	   				   				 "height": "20em",
   				   					 "overflow": "auto",
   				   					 "overflow-x": "hidden"
	   				   			 });
	    	   
	    	   angular.forEach($scope.specialties, function(specialty, key){
	    		   ul.append(
    				   $("<li/>").append(
						   $("<a/>").prop("href", "#").text(specialty.specialty)
    				   )
	    		   ) 
	    	   });
	    	   
	    	   $("#barberSpecialtiesDiv").append(
    			   $("<div/>").addClass("row-fluid").append(
	    			   $("<div/>").addClass("btn-group").append(
						   $("<button/>").addClass("btn btn-inverse dropdown-toggle")
						   				 .attr("data-toggle", "dropdown")
						   				 .prop("value", "Specialty")
						   				 .text("Specialty")
						   				 .append(
					   						 $("<span/>").addClass("caret")
						   				 ),
		   				   ul
	    			   ),
	    			   $("<button/>").addClass("btn btn-inverse")
	    			   				 .append("Add")
    			   )
			   )
	       }

	       getUserData($scope);
	       
	       getDefaultApptTimes($scope);
	       
	       $scope.yearsOfExperience = ["1", "2", "3", "4", "5", "5+"];
	       $scope.avgCutTime = ["5", "10", "15", "20", "25"];
	       
	       if($scope.apptTimes)
    	   {
	    	   angular.forEach($scope.apptTimes, function(time, key){
	    		  $(".normalTimeIn").append(
	    				  $("<li/>").append(
	    						  $("<a/>").prop("href", "#").text(time)
						  )
				  ) 
	    	   });
			  
	    	   $scope.apptTimes["00:00 AM"] = "OFF";
	    	   
	    	   angular.forEach($scope.apptTimes, function(time, key){
	    		  $(".barberhours").append(
	    				  $("<li/>").append(
	    						  $("<a/>").prop("href", "#").text(time)
						  )
				  ) 
	    	   });
    	   }
	       
	       angular.forEach($scope.yearsOfExperience, function(exp, key){
	    		  $(".yearsOfExperience").append(
	    				  $("<li/>").append(
	    						  $("<a/>").prop("href", "#").text(exp)
						  )
				  ) 
	    	   });
	       
	       angular.forEach($scope.avgCutTime, function(time, key){
	    		  $(".avgCutTime").append(
	    				  $("<li/>").append(
	    						  $("<a/>").prop("href", "#").text(time)
						  )
				  ) 
	    	   });
	       
	       $scope.getUser();
	       //$scope.getBarberDetails();
	       
	       $rootScope.toggle("barberScheduleOverlay", "on");
	       
	       $(".barberhours li a").click(function()
		   {    		
	    	  var time; 
	    	  var pDiv;
	    	  
	    	  if($(this).parent().parent().prev().val().trim() == "Time In")
    		  {
	    		 if($(this).text().trim() == "OFF") 
	    		 {
	    			 pDiv =  $(this).parent().parent().prev().parent().nextAll("div"); 
	    		 
	    			 $(pDiv[0]).children("button").text("OFF");
	    		 }else
					  if($($(this).parent().parent().prev().parent().nextAll("div")[0]).children("button").text() == "OFF")
					  {
						  $($(this).parent().parent().prev().parent().nextAll("div")[0]).children("button").text("Time Out")
					  }
		    	  
				 if(scheduling[$(this).parent().parent().attr("value").toLowerCase()])
				 {
					 time = scheduling[$(this).parent().parent().attr("value").toLowerCase()].split("-");
					 
					 scheduling[$(this).parent().parent().attr("value").toLowerCase()] = $(this).text() == 'OFF' ? ("OFF - OFF") : (($(this).text() + " - ") + (time[1].trim() == "OFF" ? "Time Out" : time[1].trim()));
				 }
				 else
					 scheduling[$(this).parent().parent().attr("value").toLowerCase()] = $(this).text() == 'OFF' ? ("OFF - OFF") : ($(this).text() + " - ");
    		  }else
    			  if($(this).parent().parent().prev().val().trim() == "Time Out")
        		  {
    				  if($(this).text().trim() == "OFF")
    				  {
    					  pDiv =  $(this).parent().parent().prev().parent().prevAll("div"); 
    					  
    					  $(pDiv[0]).children("button").text("OFF");
    				  }else
    					  if($($(this).parent().parent().prev().parent().prevAll("div")[0]).children("button").text() == "OFF")
						  {
    						  $($(this).parent().parent().prev().parent().prevAll("div")[0]).children("button").text("Time In")
						  }
    		    	  
    	    		 if(scheduling[$(this).parent().parent().attr("value").toLowerCase()])
    				 {
    					 time = scheduling[$(this).parent().parent().attr("value").toLowerCase()].split("-");
    					 
    					 scheduling[$(this).parent().parent().attr("value").toLowerCase()] = $(this).text() == 'OFF' ? ("OFF - OFF") : ((time[0].trim() == "OFF" ? "Time In" : time[0].trim()) + " - " + $(this).text());
    				 }
    				 else
    					 scheduling[$(this).parent().parent().attr("value").toLowerCase()] = $(this).text() == 'OFF' ? ("OFF - OFF") : (" - " + $(this).text());
        		  }
	    	  
			  $(this).parent().parent().prev().text($(this).text());
	       });
	       $(".specialties").change(function(){
	    	   alert($(this).val());
	       });
	       $(".normalTimeIn li a").click(function()
		   {    		
	    	   barberInfo.normalTimeIn = $(this).text();
	    	  
			   $(this).parent().parent().prev().text($(this).text());
	       });
	       $(".yearsOfExperience li a").click(function()
		   {    		
	    	   barberInfo.yearsOfExperience = $(this).text();
	    	  
			   $(this).parent().parent().prev().text($(this).text());
	       });
	       $(".avgCutTime li a").click(function()
		   {    		
	    	   barberInfo.avgCutTime = $(this).text();
	    	  
			   $(this).parent().parent().prev().text($(this).text());
	       });
	   }])	   
	   .controller('appointmentController', ['$scope', 'MbsAPI', 'PlacesAPI', '$routeParams', '$location', function ($scope, MbsAPI, PlacesAPI, $routeParams, $location) {		   
	       var searchObject = $location.search();
    	   $scope.calendarEvents = [];

	       $scope.getUser = function () {
	           $scope.userInfo = MbsAPI.getUserProfile({
	               call: "login/gather", values: $scope.mbsProfileID,
	               accountType: getAccountType($scope.mbsAccountType)
	           },
                   function (data) {
                       if (data && data.response.success) {

                       } else {
                           //error getting user data
                       }

                       //showNavigation("search");
                   });
	       }
	       $scope.getBarberAppointments = function () {
	    	   showLoadingBar("Loading Appointments...");
	           $scope.barberAppointments = MbsAPI.getBarberAppointments({
	               call: "appointment/gather/barber", barberID: searchObject.barberID
	           },
                   function (data) {
                       if (data && data.response.success) 
                       {
                    	   if (data.member) 
                        	   buildBarberProfile(data.member, $scope);
                               
                           if (data.appointment) 
                           {
                        	   buildBarberProfile(data.member, $scope);
                               buildAppointments(data.appointment, $scope);
                               
                               $scope.apptTimes = {};
                               $scope.barberSchedule = $scope.currentBarber.barberSchedule != null && $scope.currentBarber.barberSchedule.barberScheduleID > 0 ? 
                            		   				   $scope.currentBarber.barberSchedule : {};
                               
                               getDefaultApptTimes($scope);

                               if($scope.currentAppointments)
                        	   {
                            	   angular.forEach($scope.currentAppointments, function (appointment, key) {
                                       var currentAppointment = new Object();

                                       currentAppointment.id = appointment.appointmentID;
                                       currentAppointment.barberID = appointment.barberID;
                                       currentAppointment.profileID = appointment.profileID;
                                       currentAppointment.wasCancelled = appointment.wasCancelled;
                                       
                                       if(appointment.barber)
                                       {
                                    	   currentAppointment.title = appointment.barber.profile.displayName;
                                           currentAppointment.image = getProfileImage(appointment.profile.image);
                                       }
                                       else
                                    	   if(appointment.profile)
                                    	   {
                                    		   currentAppointment.title = appointment.profile.displayName;
                                               currentAppointment.image = getProfileImage(appointment.image);
                                    	   }
                                       
                                       currentAppointment.class = appointment.wasCancelled == "true" ? "event-important" : "event-success";
                                       currentAppointment.status = appointment.wasCancelled == "true" ? "Cancelled" : "Accepted";
                                       currentAppointment.start = Date.parse(appointment.appointmentDate);
                                       
                                       var time = new Date(Date.parse(appointment.appointmentDate));
                                       
                                       currentAppointment.time = getReadableTime(time);
                                       currentAppointment.end = Date.parse(appointment.appointmentDate);
                                       currentAppointment.appointmentStatus = appointment.appointmentStatus;

                                       $scope.calendarEvents.push(currentAppointment);
                                   });            
                        	   }
                               
                               if($scope.currentBarber.barberStatus.vacationStartDate && $scope.currentBarber.barberStatus.vacationEndDate)
                        	   {
                            	   var vacation = new Object();

                            	   vacation.id = 0;
                            	   vacation.barberID = $scope.currentBarber.barberID;                                   
                                   
                            	   vacation.class = "event-info";
                            	   vacation.start = Date.parse($scope.currentBarber.barberStatus.vacationStartDate);
                                   vacation.status = "Vacation";
                                   vacation.end = Date.parse($scope.currentBarber.barberStatus.vacationEndDate);

                                   $scope.calendarEvents.push(vacation);
                        	   }
                            	   
                        	   initializeCalendar();
                           }
                       }
                       
        	    	   removeLoadingBar();
                   });
	       }
	       $scope.createAppointment = function (apptDate) {
	    	   
	    	   postStatusMessage("Creating Appointment", "info");
	    	   
	           $scope.userAppt = MbsAPI.createAppointment({
	               call: "appointment/create", values: $scope.mbsProfileID,
	               appointmentDate: apptDate.toUTCString(),
	               appointmentStatus: "Accepted", 
	               barberID: $scope.currentBarber.barberID
	           },
                   function (data) {
                       if (data && data.response.success) {
            	   			if(data.appointment)
        	   				{
                                var currentAppointment = new Object();

                                currentAppointment.id = data.appointment.appointmentID;
                                currentAppointment.barberID = data.appointment.barberID;
                                currentAppointment.profileID = data.appointment.profileID;
                                currentAppointment.wasCancelled = "false";
                                
//                                if(appointment.barber)
//                                {
//                             	   currentAppointment.title = appointment.barber.profile.displayName;
//                                    currentAppointment.image = getProfileImage(appointment.profile.image);
//                                }
//                                else
//                             	   if(appointment.profile)
//                             	   {
                             		   currentAppointment.title = $scope.mbsDisplayName;
                                       currentAppointment.image = null;//getProfileImage($scope.mbsProfileImage);
                             	   //}
                                
                                currentAppointment.class = "event-success";
                                currentAppointment.status = "Accepted";
                                currentAppointment.start = Date.parse(data.appointment.appointmentDate);
                                
                                var time = new Date(Date.parse(data.appointment.appointmentDate));
                                
                                currentAppointment.time = getReadableTime(time);
                                currentAppointment.end = Date.parse(data.appointment.appointmentDate);
                                currentAppointment.appointmentStatus = data.appointment.appointmentStatus;

                                $scope.calendarEvents.push(currentAppointment);  
                                $scope.currentAppointments.push(data.appointment);  
                                
                                initializeCalendar();
                                
                                updateStatusMessage("Appointment Created", "success");
                     	   }
                       } else {
                    	   updateStatusMessage("Couldn't Create Appointment", "error");
                       }

                       //showNavigation("search");
                   });
	       }
	       $scope.deleteAppointment = function (appt) {
	    	   
	    	   postStatusMessage("Cancelling Appointment", "info");
	    	   
	           $scope.cancelAppt = MbsAPI.deleteAppointment({
	               call: "appointment/delete", values: $scope.mbsProfileID,
	               appointmentID: appt.id,
	               appointmentStatus: "Cancelled"
	           },
                   function (data) {
                       if (data && data.response.success) {
                    	   if(data.appointment)
                		   {
	            	   			if($scope.calendarEvents)
	        	   				{
	            	   				angular.forEach($scope.calendarEvents, function(event, key){
	            	   					if(event.id == data.appointment.appointmentID)
	            	   					{
	            	   						event.appointmentStatus = data.appointment.appointmentStatus;
	            	   						event.status = "Cancelled";
	            	   						event.class = "event-important";
	            	   						event.wasCancelled = "true";
	            	   					}
	            	   					
	            	   				});
	        	   				}
	            	   			
	            	   			if($scope.currentAppointments)
            	   				{
	            	   				angular.forEach($scope.currentAppointments, function(appointment, key){
	            	   					if(appointment.appointmentID == data.appointment.appointmentID)
	            	   					{
	            	   						appointment.appointmentStatus = data.appointment.appointmentStatus;
	            	   						appointment.wasCancelled = "true";
	            	   					}
	            	   					
	            	   				});
	                     	   }
	                                
                                initializeCalendar();
	                                
                                updateStatusMessage("Appointment Cancelled", "success");
                		   }
                       } else {
                    	   updateStatusMessage("Couldn't Cancel Appointment", "error");
                       }

                       //showNavigation("search");
                   });
	       }

	       getUserData($scope);
	       
	       $scope.getBarberAppointments();
	       
	       function initializeCalendar()
	       {
	    	   var calendarOptions = {
    	    		   events_source: $scope.calendarEvents,
    	    		   apptTimes: $scope.apptTimes,
    	    		   barberSchedule: $scope.barberSchedule,
    	    		   scope: $scope,
    	    		   view: "month",
    	    		   tmpl_path: "tmpls/",
    	    		   tmpl_cache: false,
    	    		   onAfterViewLoad: function(view){
    	    			   $(".topHeader h3").text(this.getTitle());
    	    		   },
    	    		   classes: {
    	    			   months: {
    	    				   general: 'label'
    	    			   }
    	    		   }
    		       }; 
    	       
    	       var calendar = $('#calendar').calendar(calendarOptions);	
    	       
    	       $('.btn-group button[data-calendar-nav]').each(function() {
    		   		var $this = $(this);
    		   		$this.click(function() {
    		   			calendar.navigate($this.data('calendar-nav'));
    		   		});
    		   	});
    	       $('.btn-group button[data-calendar-view]').each(function() {
    		   		var $this = $(this);
    		   		$this.click(function() {
    		   			calendar.view($this.data('calendar-view'));
    		   		});
    		   	});    	   
	       }
	       
	       //<!--         <script type="text/javascript"> -->
//         var calendar = $("#calendar").calendar(
//             {
//                 tmpl_path: "../tmpls/",
//                 events_source: function () { return []; }
//             });         
//     </script>
	   }])
       /* .controller('SMOFileUploadController', ['$scope', '$http', 'SmoAPI', '$filter', '$window', function ($scope, $http, SmoAPI) {
            var url = API_ENDPOINT + 'file/upload/image/' + $scope.smoUsername + '/' + $scope.smoProfileID;

            url += '?album=' + $scope.smoGalleryName + '&galleryid=' + $scope.smoGalleryID + '&caption=&platformtype=web';//&imagetype=smo&mediatype=image&category=photography&categoryid=3';

            if (category != null) {
                url += '&mediatype=' + uploadType + ((uploadType == mediaTypeImage) ? '&imagetype=' : '&videotype=') + 'smo';

                var selector = document.getElementById("categoryTypeSelect");

                if (option != null)
                    url += "&category=" + selector.options[category - 1].text + "&categoryid=" + selector.options[category - 1].value;

                $scope.options = { url: url };

                $scope.loadingFiles = true;
                $http.get(url)
                     .then(
                    		 function (response) {
                    		     $scope.loadingFiles = false;
                    		     $scope.queue = response.data.files || [];
                    		 },
                    		 function () {
                    		     $scope.loadingFiles = false;
                    		 }
                     	);
            } else
                if (doingUpload)
                    postStatusMessage('please select a category', 'error');
        }])
       .controller('FileDestroyController', ['$scope', '$http', function ($scope, $http) {
           var file = $scope.file, state;

           if (file.url) {
               file.$state = function () {
                   return state;
               };

               file.$destroy = function () {
                   state = 'pending';

                   return $http(
            			   		{
            			   		    url: file.deleteUrl,
            			   		    method: file.deleteType
            			   		}).then(
            			   				function () {
            			   				    state = 'resolved';
            			   				    $scope.clear(file);
            			   				},
            			   				function () {
            			   				    state = 'rejected';
            			   				}
            			   	  );
               };
           } else
               if (!file.$cancel && !file._index) {
                   file.$cancel = function () {
                       $scope.clear(file);
                   };
               }
       }]);*/
/* .controller('loginController', ['$scope', 'SmoAPI', function($scope, SmoAPI)
 {
     $scope.authUser = function()
     {
         $scope.userAuth = SmoAPI.loginUser({call:"auth/check/username", username:'j.ant.wallace@gmail.com'});
         console.log($scope.userAuth.data);
         var s = "";
     }
 }])
 .controller('loginController', ['$scope', 'SmoAPI', function($scope, SmoAPI)
 {
     $scope.authUser = function()
     {
         $scope.userAuth = SmoAPI.loginUser({call:"auth/check/username", username:'j.ant.wallace@gmail.com'});
         console.log($scope.userAuth.data);
         var s = "";
     }
 }])
 .controller('loginController', ['$scope', 'SmoAPI', function($scope, SmoAPI)
 {
     $scope.authUser = function()
     {
         $scope.userAuth = SmoAPI.loginUser({call:"auth/check/username", username:'j.ant.wallace@gmail.com'});
         console.log($scope.userAuth.data);
         var s = "";
     }
 }])
 .controller('loginController', ['$scope', 'SmoAPI', function($scope, SmoAPI)
 {
     $scope.authUser = function()
     {
         $scope.userAuth = SmoAPI.loginUser({call:"auth/check/username", username:'j.ant.wallace@gmail.com'});
         console.log($scope.userAuth.data);
         var s = "";
     }
 }]);*/

//authController.$inject = ['$scope', 'SmoAPI'];
//siteController.$inject = ['$scope', 'SmoAPI'];
//testController.$inject = ['$scope'];