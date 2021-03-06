﻿'use strict';
/// <reference path="../util/mbsutility.js" />

/**controllers*/
var authFailed = false;
var iosTok, platformType, navigationData, hasAds = false, splashScreen;
var isProd = true;
var db = window.openDatabase("mybarbershop", "1.0", "MyBarberShop", 1000000);

angular.module('mbs.controllers', [])
        .controller('authController', ['$scope', 'MbsAPI', '$ionicPopup', '$timeout', '$ionicLoading', '$state', '$rootScope', '$cordovaToast', '$cordovaPush', '$cordovaDevice', '$cordovaSpinnerDialog', '$cordovaDialogs', '$ionicScrollDelegate', function ($scope, MbsAPI, $ionicPopup, $timeout, $ionicLoading, $state, $rootScope, $cordovaToast, $cordovaPush, $cordovaDevice, $cordovaSpinnerDialog, $cordovaDialogs, $ionicScrollDelegate) {
            $scope.screenHeight = screen.height - 80;
            var tokenID;
            var user = 0;
            var isRegister = false;
            $scope.showQuestion = false, $scope.showNewPassword = false;
            //var request = indexedDB.deleteDatabase("mbs");
            globalScope = $scope;

            $scope.backgroundImage = "images/skylineday.jpg";

            if (db != null)
                db.transaction(initializeDB, errorCB, successCB);

            $rootScope.$on('$cordovaPush:notificationReceived', function (event, notification)
            {
                if (notification.notification != undefined)
                    notification = notification.notification;

                if (ionic.Platform.isIOS()) {
                    /*if (notification.alert)
                        navigator.notification.alert(notification.alert)

                    if (notification.sound)
                        var snd = new Media(event.sound);

                    snd.play();*/

                    handlePushNotifications($cordovaToast, $scope, notification, "ios", $rootScope);

                    $cordovaPush.setBadgeNumber(1)
                        .then(function (result) {
                            // Success!
                        }, function (err) {
                            // An error occurred. Show a message to the user
                        });
                }
                else
                    if (ionic.Platform.isAndroid()) {
                        switch (notification.event) {
                            case 'registered':
                                if (notification.regid.length > 0) {
                                    tokenID = notification.regid;
                                    platformType = "platform_type_android";

                                    if (db) {
                                        db.transaction(checkUser, errorCB);
                                    }
                                }
                                break;

                            case 'message':
                                // this is the actual push notification. its format depends on the data model from the push server
                                //alert('message = ' + notification.message + ' msgCount = ' + notification.msgcnt);
                                handlePushNotifications($cordovaToast, $scope, notification, "android", $rootScope);
                                break;

                            case 'error':
                                //alert('GCM error = ' + notification.msg);
                                break;

                            default:
                               // alert('An unknown GCM event has occurred');
                                break;
                        }
                    }
                    else
                        if (ionic.Platform.isWindowsPhone())
                            config = {

                            }
            });

            //initializeStorage(function (db) {
            //    user = checkUser();
            //}, function (e) {
            //    alert(e.message);
            //});

            //if (user == 0)
            //    user = checkUser();

            //if(user != 0)
            //{
               // $scope.authUser();
            //}

            $scope.toggleLoginRegister = function (flow) {

                if (flow) {
                    if(flow == "ForgotPassword")
                    {
                        $("#mbsforgotpassword").removeAttr("style");
                        $("#mbslogin").css("display", "none");
                        $ionicScrollDelegate.scrollTop(true);
                    }else
                        if(flow == "Login")
                        {
                            $scope.showNewPassword = false;
                            $scope.showQuestion = false;
                            $scope.passwordAnswer = null;
                            $scope.passwordQuestion = null;
                            $("#forgotPasswordConfirm").val("");
                            $("#mbslogin").removeAttr("style");
                            $("#mbsforgotpassword").css("display", "none");
                        }
                } else {
                    if (isRegister) {
                        $("#mbslogin").removeAttr("style");//css("display", "block");
                        $("#mbsregister").css("display", "none");
                        isRegister = false;
                        $ionicScrollDelegate.scrollTop(true);
                    } else {
                        $("#mbslogin").css("display", "none");
                        $("#mbsregister").removeAttr("style");//css("display", "inline");
                        isRegister = true;
                    }
                }
            };

            $("#l_email").focusin(function () {
                $scope.hidePopover();
            });
            $("#l_password").focusin(function () {
                $scope.hidePopover();
            });
            $("#inputEmail").focusout(function () {
                $scope.checkUser();
            });
            //$("#inputConPassword").keydown(function () {
            //    $scope.checkPasswords();
            //});
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
                $(element).prev('span').removeClass('assertive');
                $(element).parents('span').removeClass('balanced');
                $scope.emailErrorText = { visibility: "hidden" };
                $scope.emailStatus = { visibility: "hidden" };
                $scope.passwordErrorText = { visibility: "hidden" };
            };
            $scope.checkPasswords = function () {
                if (!(typeof $("#inputPassword").val() === "undefined") && !(typeof $("#inputPassword").val() === "undefined") && $("#inputPassword").val().length > 0 && $("#inputConPassword").val().length > 0 && !($("#inputConPassword").val() === "") && !($("#inputConPassword").val() === "")) {
                    if (!($("#inputPassword").val() === $("#inputConPassword").val())) {
                        //$("#inputConPasswordDiv").removeClass("has-success").addClass("has-error");
                        //$("#inputConPasswordLabel").css("display", "inline").text("Passwords do not match!");
                        //$("#inputConPasswordSpan").removeClass("glyphicon-ok").addClass("glyphicon-remove");

                        //showIonicAlert($ionicPopup, $timeout, "Invalid Password", "Passwords do not match!", "assertive", "button-assertive");
                        showCordovaAlert($cordovaDialogs, "Invalid Password", "Passwords do not match!", "OK");
                        $("#inputConPasswordSpan").addClass("assertive");
                    } else {
                        //$("#inputConPasswordDiv").removeClass("has-error").addClass("has-success");
                        //$("#inputConPasswordLabel").css("display", "none").text("");
                        //$("#inputConPasswordSpan").removeClass("glyphicon-remove").addClass("glyphicon-ok");

                        $("#inputConPasswordSpan").removeClass("assertive").addClass("balanced");
                    }
                }
            };
            $scope.checkUser = function () {
                if (!(typeof $("#inputEmail").val() === "undefined") && $("#inputEmail").val().length > 0 && !($("#inputEmail").val() === "") && validateEmail($("#inputEmail").val())) {
                    
                    $scope.mbsData = MbsAPI.checkUsername({ call: "auth/check/username", userName: $("#inputEmail").val() },
                    function (data) {
                        if (data && data.response.success) {
                            //showIonicAlert($ionicPopup, $timeout, "Invalid Username", "Username already taken!", "assertive", "button-assertive");
                            showCordovaAlert($cordovaDialogs, "Invalid Username", "Username already taken!", "OK");
                            $("#inputEmail").css("background-color", "red");
                            $("#inputEmailSpan").removeClass("balanced");
                            $("#inputEmailSpan").addClass("assertive");

                            $scope.toggleRegFields(true);
                        } else {
                            if (data.response.message === "Username Check Succeeded!") {
                                $("#inputEmail").css("background-color", "green");
                                $("#inputEmailSpan").removeClass("assertive");
                                $("#inputEmailSpan").addClass("balanced");

                                $scope.toggleRegFields(false);
                            }
                        }
                    }, function error(e) {
                        if (e.status == 500 || e.status == 404) {
                            toggleIonicLoading($ionicLoading, null, false);
                        }
                    });
                } else {
                    if (!(typeof $("#inputEmail").val() === "undefined") && $("#inputEmail").val().length == 0)
                    {
                        $("#inputEmail").css("background-color", "green");
                        $("#inputEmailSpan").removeClass("assertive");
                        $("#inputEmailSpan").removeClass("balanced");

                        $scope.toggleRegFields(true);
                    }else
                    {
                        $("#inputEmail").css("background-color", "red");
                        $("#inputEmailSpan").removeClass("balanced");
                        $("#inputEmailSpan").addClass("assertive");

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
                    var registerButton = $("#registerButton").ladda();

                    $("#l_email").val("");
                    $("#l_password").val("");

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

                    //toggleIonicLoading($ionicLoading, "Creating account ...", true, false, "assertive");
                    //showCordovaLoading($cordovaSpinnerDialog, "Account Creation", "Creating account ...", true, true);
                    //$("#registerButton").text("Creating account");
                    registerButton.ladda("start");

                    $scope.mbsData = MbsAPI.createUser({
                        call: "auth/create", userName: $("#inputEmail").val(), displayName: $("#inputDisplayName").val(),
                        passHash: $("#inputPassword").val(), passQuest: $("#inputPassQuest").val(),
                        passAns: $("#inputPassAns").val(), accountType: accountType
                    },
                    function (data) {
                        if (data && data.response.success) {
                            //show an alert for success
                            //just log the user in?

                            $scope.logUsername = data.admin.username;
                            $scope.logPassword = data.admin.passwordHash;
                            $scope.newUser = true;

                            //toggleIonicLoading($ionicLoading, "Account created successfully ...", true, false, "balanced");
                            //showCordovaLoading($cordovaSpinnerDialog, "Account Creation", "Account created successfully", false, true);
                            /*SweetAlert.*/swal({ title: "Account created successfully!", timer: 2000, showConfirmButton: false, type: "success" });

                            $scope.authUser(true);
                        } else {
                            if (data.response.message === "User Creation Failed!") {
                                //handle creation error
                                //$("#invalidUserCreation").css("display", "block");

                                //toggleIonicLoading($ionicLoading, null, false);
                                //showCordovaLoading($cordovaSpinnerDialog, null, null, false, false);
                                $("#registerButton").text("Register");
                                registerButton.ladda("toggle");
                                registerButton.ladda("stop");

                                //showIonicAlert($ionicPopup, $timeout, "Registration failed", "Error creating user! Please try again.", "assertive", "button-assertive");
                                showCordovaAlert($cordovaDialogs, "Registration failed", "Error creating user! Please try again", "OK");
                            }
                        }
                    }, function error(e) {
                        if (e.status == 500 || e.status == 404) {
                            toggleIonicLoading($ionicLoading, null, false);
                        }
                    });
                }else
                    $("#invalidRegistration").css("display", "block");
            };
            $scope.authUser = function (shouldSave) {
                var loginButton = $("#loginButton").ladda();
                
                //$("#loggingIn").css("display", "block");
                authFailed = false;

                if (validateInput($("#l_email").val()) && validateInput($("#l_password").val()))
                {
                    $scope.logUsername = $("#l_email").children("input").val();
                    $scope.logPassword = $("#l_password").children("input").val();
                }
 
                if (validateInput($scope.logUsername) && validateInput($scope.logPassword) && validateEmail($scope.logUsername)) {
                    localStorage.removeItem("navData");
                    localStorage.removeItem("notificationInfo");
                    localStorage.removeItem("imageInfo");
                    
                    //toggleIonicLoading($ionicLoading, "Logging in ...", true, false, "assertive");
                    //showCordovaLoading($cordovaSpinnerDialog, "Login", "Logging in ...", true, true);
                    //$("#loginButton").text("Logging in");
                    loginButton.ladda("start");

                    if(shouldSave)
                       db.transaction(saveUserData, errorCB, successCB);

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

                            if (iosTok)
                                tokenID = iosTok;

                            handlePushNotificationRegistration(tokenID, platformType);
 
                            //add data to local storage
                            //saveUserData($scope);

                            if (Modernizr.localstorage)
                               setUserData($scope);

                                //if ($("#memory").is(":checked"))
                                    //setCookie("smocookie", $scope.smoID, 365);

                                //redirect the page to set the users session
                            var auth = document.URL;
                            
                            if (getAccountType(profile.accountType.accountType) == "Barber" && ($scope.newUser != undefined ? $scope.newUser : false))
                                $state.go('barbersetup');
                                //getPageView("auth/login.html", "barbersetup.html", null);
                            else
                                $state.go('main');
                            	//getPageView("login.html", "///views/index.html", null);
                        } else {
                            //auth user failed
                            authFailed = true;
                            //$("#loginControls input").popover('show');
                            //$("#invalidLogin").css("display", "block");

                            //toggleIonicLoading($ionicLoading, null, false);
                            //$("#loginButton").text("Login");
                            loginButton.ladda("toggle");
                            loginButton.ladda("stop");
                            //showCordovaLoading($cordovaSpinnerDialog, null, null, false, false);
                            ///showIonicAlert($ionicPopup, $timeout, "Login failed", "Invalid username or password! Please try again.", "assertive", "button-assertive");
                            showCordovaAlert($cordovaDialogs, "Login failed", "Invalid username or password! Please try again.", "OK");
                        }
                    }, function error(e) {
                        if (e.status == 500 || e.status == 404) {

                            toggleIonicLoading($ionicLoading, null, false);
                        }
                    });
                } else {
                    //redirect to a different page to track login attempts
                    authFailed = true;
                    $("#invalidLogin").css("display", "block");
                }
            };
            $scope.checkPasswordQuestion = function () {
                if (validateInput($("#forgotEmail").val()) && validateEmail($("#forgotEmail").val())) {

                    $scope.questionData = MbsAPI.forgotPassword({ call: "auth/forgot/password", userName: $("#forgotEmail").val() },
                    function (data) {
                        if (data && data.response.success) {
                            $scope.showQuestion = true;

                            $scope.forgotUsername = $("#forgotEmail").val();
                            $("#forgotEmail").val("");
                            $scope.passwordQuestion = data.admin.passwordQuestion;
                            $scope.passwordAnswer = data.admin.passwordAnswer;
                        } else
                            showCordovaAlert($cordovaDialogs, "Invalid Username", "Username is incorrect. Please try again!", "OK");
                    }, function error(e) {
                        if (e.status == 500 || e.status == 404) {
                            toggleIonicLoading($ionicLoading, null, false);
                        }
                    });
                } else
                    showCordovaAlert($cordovaDialogs, "Invalid Email", "Email is incorrect. Please try again!", "OK");
            };
            $scope.checkAnswer = function () {
                if ($scope.passwordAnswer.toLowerCase() === $("#forgotAnswer").val().toLowerCase()) {
                    $scope.showNewPassword = true, $scope.showQuestion = false;
                    $("#forgotAnswer").val("");
                }
                else
                    showCordovaAlert($cordovaDialogs, "Invalid Answer", "Answer is incorrect. Please try again!", "OK");
            };
            $scope.checkForgotPasswords = function () {
                if (validateInput($("#forgotPassword")) && validateInput($("#forgotPasswordConfirm")))
                {
                    if (!($("#forgotPassword").val() === $("#forgotPasswordConfirm").val())) {
                        showCordovaAlert($cordovaDialogs, "Invalid Password", "Passwords do not match!", "OK");

                        return false;
                    } else {
                        return true;
                    }
                }

                return false;
            };
            $scope.updatePassword = function () {
                var changePasswordButton = $("#forgotButton").ladda();

                if ($scope.checkForgotPasswords()) {
                    changePasswordButton.ladda("start");

                    $scope.newPassword = MbsAPI.resetPassword({ call: "auth/reset/password", userName: $scope.forgotUsername, passHash: $("#forgotPassword").val() },
                        function (data) {
                            if (data && data.response.success) {
                                $scope.logUsername = $scope.forgotUsername;
                                $scope.logPassword = $("#forgotPassword").val();
                                $("#forgotPassword").val("");

                                swal({ title: "Password reset successfully!", timer: 2000, showConfirmButton: false, type: "success" });

                                changePasswordButton.ladda("stop");

                                $scope.authUser(true);
                            } else {
                                changePasswordButton.ladda("stop");
                                showCordovaAlert($cordovaDialogs, "Change Password", "Couldn't save new password. Please try again!", "OK");
                            }
                        });
                }
            };

            function handlePushNotificationRegistration(tokenID, platformType) {
                
                MbsAPI.registerForPushNotifications({
                    call: "notification/register/device", values: $scope.mbsProfileID, deviceID: tokenID, deviceType: platformType,
                    mobileDeviceID: $cordovaDevice.getUUID()
                },
                    function (data) {
                        if (data && data.response.success) {

                        } else {

                        }
                    }, function error(e) {
                        if (e.status == 500 || e.status == 404) {
                            toggleIonicLoading($ionicLoading, null, false);
                        }
                    });
            }

            $("#l_email").keydown(function (e) {
                if((e.which != null && e.which == 13) || (e.keyCode != null && e.keyCode == 13))
                {
                    $scope.authUser(true);
                }
            });

            $("#l_password").keydown(function (e) {
                if((e.which != null && e.which == 13) || (e.keyCode != null && e.keyCode == 13))
                {
                    $scope.authUser(true);
                }
            });

            /*if (ionic.Platform.isIOS())
                if (db) {
                    db.transaction(checkUser, errorCB);
                }*/
            $ionicScrollDelegate.scrollBottom(true);

            setTimeout(function () {
                ionic.material.motion.fadeSlideInRight();
            }, 500);

            if ((new Date()).getHours() >= 15)
                $scope.backgroundImage = "images/skylinenight.jpg";
            else
                $scope.backgroundImage = "images/skylineday.jpg";
        }])
	   .controller('siteController', ['$scope', '$location', 'MbsAPI', '$routeParams', '$ionicLoading', '$filter', '$sce', '$ionicSideMenuDelegate', '$state', '$ionicPopup', '$rootScope', '$cordovaAppAvailability', '$cordovaSpinnerDialog', '$ionicListDelegate'/*, '$cordovaAdMobPro'*/, '$ionicNavBarDelegate', '$ionicScrollDelegate', '$ionicTabsDelegate', function ($scope, $location, MbsAPI, $routeParams, $ionicLoading, $filter, $sce, $ionicSideMenuDelegate, $state, $ionicPopup, $rootScope, $cordovaAppAvailability, $cordovaSpinnerDialog, $ionicListDelegate/*, $cordovaAdMobPro*/, $ionicNavBarDelegate, $ionicScrollDelegate, $ionicTabsDelegate) {
	       
	       //showCordovaLoading($cordovaSpinnerDialog, "Loading", "Loading information ...", true, true);
	       getUserData($scope);
	       $scope.viewHeight = (screen.height - (hasAds ? 50 : 0)) + "px";
	       $scope.isCustomer = false, $scope.hasBarbers = false, $scope.hasClients = false, $scope.tabTitle = "", $scope.miscIcon = $scope.barbersIcon;
	       $scope.isAndroid = ionic.Platform.isAndroid();

	       if($scope.backButtonPressed)
	            getNavData($scope);

	       var searchObject = $location.search();
	       $scope.hasNotifications = false;
	       $scope.myTitle = "Appointments";
		   $scope.toggleLeft = function () {
		       $ionicSideMenuDelegate.toggleLeft();
		   };
		   $scope.getUser = function()
		   {
		       toggleIonicLoading($ionicLoading, "Loading information ...", true, false, "assertive");

		       $ionicNavBarDelegate.showBar(true);

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
                                    $scope.mbsBarberID = data.barber.barberID;
                                    $scope.mbsProfileImage = getProfileImage($scope.currentBarber.profile.image.defaultImage, "profile", "avatar");

                                    setUserData($scope);
                                }

                                if (data.barberShop)
                                    buildBarberShop(data.barberShop, $scope, $sce);

                                if (data.appointment)
                                    buildAppointments(data.appointment, $scope, $filter, true, null, true);

                                if (data.barbers) {
                                    if (data.barbers.length > 0)
                                        $scope.hasBarbers = true;

                                    $scope.tabTitle = "Barbers";
                                    $scope.miscIcon = $scope.barbersIcon;

                                    buildUserBarbers(data.barbers, $scope);
                                }
                                else
                                    if (data.client) {
                                        if (data.client.length > 0)
                                            $scope.hasClients = true;

                                        $scope.tabTitle = "Clients";
                                        $scope.miscIcon = $scope.clientsIcon;

                                        buildClients(data.client, $scope);
                                    }

                                $scope.isCustomer = isBarber($scope.mbsAccountType) ? false : true;

                                if ($scope.currentAppointments.length == 0 && $scope.currentBarberShops.length == 0)
                                {
                                    $scope.hasAppointments = false;
                                    $scope.appointmentHeight = screen.height + "px";// >= 1600 ? "250px" : (screen.height / 2) + "px"; //"250px";
                                    $scope.hasBarberShops = false;
                                    $scope.barberShopHeight = screen.height + "px"; //(screen.height / 2) + "px";//"250px";

                                    //if (screen.height >= 1600)
                                        //$("#shopScroll").css("top", "-40px");
                                } else
                                {
                                    if ($scope.currentAppointments.length == 0)
                                    {
                                        $scope.hasAppointments = false;
                                        $scope.appointmentHeight = screen.height + "px";// >= 1600 ? "300px" : (((screen.height / 2) - (ionic.Platform.isAndroid() ? 120 : 30)) + "px");//"100px";
                                    } else
                                    {
                                        $scope.hasAppointments = true;
                                        $scope.appointmentHeight = (screen.height - 108) + "px";// >= 1600 ? "300px" : (((screen.height / 2) - (ionic.Platform.isAndroid() ? 120 : 0)) + "px");//"250px";
                                    }

                                    if ($scope.currentBarberShops.length == 0)
                                    {
                                        $scope.hasBarberShops = false;
                                        $scope.barberShopHeight = screen.height + "px";//(screen.height - 50) + "px"; //((screen.height / 2) - 50) + "px";//"100px";
                                    } else
                                    {
                                        $scope.hasBarberShops = true;
                                        $scope.barberShopHeight = (screen.height - (hasAds ? 50 : 0) - 108) + "px"; //((screen.height / 2) - (hasAds ? 50 : 0)) + "px";//"250px";
                                    }
                                }                               

                                $scope.showAppointments();
                                $scope.showBarberShops();

                                $scope.playEffect();
                            }
                        }else
                        {
                            //error getting user data
                            toggleIonicLoading($ionicLoading, "Could not load profile", true, true, "assertive");
                            //showCordovaLoading($cordovaSpinnerDialog, "Profile Loading Failed", "Could not load profile", false, true);
                            toggleIonicLoading($ionicLoading, "Loading information ...", true, false, "assertive");
                            $scope.getUser();
                        }

                        //removeNotifications();
                        $scope.getProfile();
                        //showNavigation("index");

                        if(window.AdMob && hasAds)
                            showAdmobAd(window.AdMob, "banner");
                    }, function error(e) {
                        if (e.status == 500 || e.status == 404) {
                            $scope.getUser();
                        }
                    });
		   };
		   $scope.getProfile = function () {
	           $scope.profileInfo = MbsAPI.getUserProfile({
	               call: "profile/gather/details", profileID: $scope.mbsProfileID
	           },
                   function (data) {
                       if (data && data.response.success) {
                           buildProfile(data, $scope);

                           var dateCreated = splitDate($scope.currentProfile.dateCreated);

                           $scope.userImage = $scope.mbsProfileImage = getProfileImage($scope.currentProfile.image, "profile", "avatar");
                           $scope.memberSince = getReadableMonth(dateCreated.getMonth()) + " " + dateCreated.getDate() + ", " +
        	               						 dateCreated.getFullYear();

                           handleImages($scope.currentProfile.images);

                           setUserData($scope);
                       } else {
                           //error getting user data
                       }

                       toggleIonicLoading($ionicLoading, null, false);
                       //showCordovaLoading($cordovaSpinnerDialog, null, false, false);
                   }, function error(e) {
                       if (e.status == 500 || e.status == 404) {
                           toggleIonicLoading($ionicLoading, null, false);
                       }
                   });
	       };
		   $scope.showBarberShops = function()
		   {
		       //renderUserBarberShops($scope);
		   }
		   $scope.showAppointments = function ()
		   {
		       //renderUserAppointments($scope, $filter);
		   }
		   $scope.deleteAppointment = function (appt) {

		       //postStatusMessage("Cancelling Appointment", "info");
		       toggleIonicLoading($ionicLoading, "Cancelling appointment ...", true, false, "assertive");
		       //showCordovaLoading($cordovaSpinnerDialog, "Cancel Appointment", "Cancelling appointment ...", true, true);

		       $scope.cancelAppt = MbsAPI.deleteAppointment({
		           call: "appointment/delete", values: $scope.mbsProfileID,
		           appointmentID: appt.appointmentID,
		           appointmentStatus: "Cancelled"
		       },
                   function (data) {
                       if (data && data.response.success) {
                           if (data.appointment) {
                               if ($scope.currentAppointments) {
                                   angular.forEach($scope.currentAppointments, function (appointment, key) {
                                       if (appointment.appointmentID == data.appointment.appointmentID) {
                                           appointment.appointmentStatus = data.appointment.appointmentStatus;
                                           appointment.wasCancelled = "true";
                                       }

                                   });
                               }

                               //updateStatusMessage("Appointment Cancelled", "success");
                               toggleIonicLoading($ionicLoading, "Appointment cancelled", true, true, "balanced");
                               //showCordovaLoading($cordovaSpinnerDialog, "Cancel Appointment", "Appointment Cancelled", false, true);
                           }
                       } else {
                           //updateStatusMessage("Couldn't Cancel Appointment", "error");
                           toggleIonicLoading($ionicLoading, "Couldn't cancel appointment", true, true, "assertive");
                           //showCordovaLoading($cordovaSpinnerDialog, "Cancel Appointment", "Could not cancel appointment", false, true);
                       }

                       //showNavigation("search");
                       $ionicListDelegate.closeOptionButtons();
                   }, function error(e) {
                       if (e.status == 500 || e.status == 404) {
                           toggleIonicLoading($ionicLoading, null, false);
                       }
                   });
		   };
		   $scope.loadBarberShop = function (barberShop) {
		       saveViewData();

	           $state.go('barbershop', { barberShopID: barberShop.barberShopID });
	       };
		   $scope.loadProfile = function () {
		       saveViewData();

	           if (getAccountType($scope.mbsAccountType) == "Customer")
	               $state.go('user', { profileID: $scope.mbsProfileID });
	           else
	               $state.go('barberprofile', { barberID: $scope.currentBarber.barberID });
	       };
		   $scope.loadSearch = function () {
		       saveViewData();

		       $state.go("shopsearch", { type: "normal" });
		   };
		   $scope.loadBarberSearch = function () {
		       saveViewData();

		       $state.go("barbersearch");
		   };
		   $scope.loadClient = function (client) {
		       if (client.profileID == $scope.mbsProfileID) {
		           if (getAccountType($scope.mbsAccountType) == "Customer")
		               $state.go('user', { profileID: $scope.mbsProfileID });
		           else
		               $state.go('barberprofile', { barberID: $scope.currentBarber.barberID });
		       } else
		           $state.go("userprofile", { profileID: client.profileID });
		   };
		   $scope.loadBarber = function (barber) {
		       $state.go("barber", { barberID: barber.barberID });
		   };
		   $scope.loadSquarePayment = function () {
		       if ($cordovaAppAvailability) {
		           $cordovaAppAvailability.check("square-commerce-v1://").then(function () {
		               $scope.loadSquarePayment = function () {
		                   $state.go("squarepayment");
		               };
		           }, function () {
		               alert("You must have the Square Register app installed to pay with Square");
		           });
		       } else {
		           $state.go("squarepayment");
		       }
		   };

	       $scope.logOut = function () {
	           //log the user out 
	           clearUserData($state);
	       };

	       getUserData($scope);
		   
	       $scope.isABarber = isBarber($scope.mbsAccountType) && ionic.Platform.isIOS();

	       $scope.loadImages = function (images) {
	           saveViewData();

	           if(isBarber($scope.mbsAccountType))
        	   {
	        	   $state.go('gallery', { userID: $scope.mbsProfileID, type: 'Barber' });
		           setImageData($scope.currentBarber.barberImages);
        	   }
	           else
	           {
	        	   $state.go('gallery', { userID: $scope.mbsProfileID, type: 'User' });
		           setImageData($scope.currentProfile.images);
	           }
	       };
	       $scope.createAppointment = function () {
	           saveViewData();

	           $state.go('appointment', { barberID: $scope.currentBarber.barberID, barberProfileID: $scope.currentBarber.profile.profileID, apptType: "Barber" });
	       };
	       $scope.handleNotificationsClick = function()
	       {
	           saveViewData();

	           $state.go('notifications');
	       }
	       $scope.handleNotificationClicked = function(notification)
	       {
	           saveViewData();

	           if(notification.title == "New Barber Shop Image")
	           {
	               $state.go('gallery', { userID: notification.barberShopID, type: 'BarberShop' });
	           }else
	               if(notification.title == "New Customer")
	               {
	                   $state.go('userprofile', { profileID: notification.profileID });
	               }
	       }
	       $rootScope.$on("HasNotifications", function () {
	           $scope.hasNotifications = true;
	       });
	       $rootScope.$on("backButtonPressed", function () {
	           $scope.backButtonPressed = true;
	       });
	       $scope.backClicked = function () {
	           $rootScope.$broadcast("HasNotifications");
	       }
		   
	       globalScope = $scope;

	       function saveViewData()
	       {
	           saveNewData(true);
	       }
	       $scope.tabClicked = function(tab)
	       {
	           $scope.myTitle = tab == "BarberClient" ? ($scope.hasBarbers ? "Barbers" : "Clients") : tab;

	           $scope.playEffect();

	           if (tab == "Shops" || tab == "BarberClient")
	               $("#createApptButton").css("display", "none");
	           else 
	               $("#createApptButton").css("display", "block");
	       }
	       $scope.playEffect = function()
	       {
	           setTimeout(function () {
	               ionic.material.motion.blinds();
	           }, 500);
	       }
	       $scope.$on("$ionicView.enter", function () {
	           getNewData($scope);

	           if ($scope.currentBarberShops && $scope.currentAppointments) {
	               $scope.isCustomer = isBarber($scope.mbsAccountType) ? false : true;

	               if ($ionicTabsDelegate.selectedIndex() > 0) {
	                    $("#createApptButton").css("display", "none");
	               }


	               $scope.newInfo = MbsAPI.getUserProfile({
	                   call: "login/gather", values: $scope.mbsProfileID,
	                   accountType: getAccountType($scope.mbsAccountType)
	               },
                    function (data) {
                        if (data && data.response.success) {
                            if (data.barberShop)
                                buildBarberShop(data.barberShop, $scope, $sce, true);

                            if ($scope.currentBarberShops.length > 0)
                                $scope.hasBarberShops = true;

                            if (data.appointment)
                                buildAppointments(data.appointment, $scope, $filter, true, true, true);

                            if ($scope.currentAppointments.length > 0)
                                $scope.hasAppointments = true;

                            if (data.barbers) {
                                if (data.barbers.length > 0)
                                    $scope.hasBarbers = true;

                                $scope.tabTitle = "Barbers";
                                $scope.miscIcon = $scope.barbersIcon;

                                buildUserBarbers(data.barbers, $scope);
                            }
                            else
                                if (data.client) {
                                    if(data.client.length > 0)
                                        $scope.hasClients = true;

                                    $scope.tabTitle = "Clients";
                                    $scope.miscIcon = $scope.clientsIcon;

                                    buildClients(data.client, $scope);
                                }                            $scope.playEffect();
                        }
                    }, function error(e) {
                        if (e.status == 500 || e.status == 404) {
                            $scope.getUser();
                        }
                    });
	           } else
	               $scope.getUser();

	           //toggleIonicLoading($ionicLoading, null, false);
	       });
	   }])
	   .controller('searchController', ['$scope', 'MbsAPI', '$ionicLoading', '$state', '$stateParams', '$ionicPopup', '$ionicNavBarDelegate', '$filter', '$rootScope', '$cordovaGeolocation', '$cordovaDialogs', function ($scope, MbsAPI, $ionicLoading, $state, $stateParams, $ionicPopup, $ionicNavBarDelegate, $filter, $rootScope, $cordovaGeolocation, $cordovaDialogs) {
	       var type = $stateParams.type;
	       
	       $scope.showFreelance = type == "BarberSetup" ? true : false;
	       $scope.screenHeight = (screen.height - (hasAds ? 50 : 0) - 50) + "px";
	       $scope.hasNotifications = false;
		   
		   //gather the users profile information
	       $scope.gatherNearByBarberShops = function () {
	           //showLoadingBar("Loading...");
	           var posOptions = { timeout: 10000, enableHighAccuracy: false };
	           
	           $cordovaGeolocation.getCurrentPosition(posOptions)
                                  .then(function (position) {
                                      
                    $scope.nearbyBarberShops = [];

                    $scope.nearbyShops = MbsAPI.getNearbyBarberShops({
                        call: "barbershop/gather/nearby", latitude: position.coords.latitude /*38.643517*/, longitude: position.coords.longitude /*-77.260843*/
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
                                    shop.stateAbbr = barberShop.address.abbreviatedStateProvince;
                                    shop.sunday = barberShop.sunday;
                                    shop.monday = barberShop.monday;
                                    shop.tuesday = barberShop.tuesday;
                                    shop.wednesday = barberShop.wednesday;
                                    shop.thursday = barberShop.thursday;
                                    shop.friday = barberShop.friday;
                                    shop.saturday = barberShop.saturday;

                                    shop.shopImage = "";

                                    if (shop.image && shop.image.imageID)
                                        shop.shopImage = getProfileImage(shop.image, "barberShop", "background");
                                    else {
                                        $.ajax({
                                            url: "https://maps.googleapis.com/maps/api/streetview?size=400x400&location=" +
                                                  shop.latitude + "," + shop.longitude + "&key=AIzaSyD2v3QTJPuxDdommKlyJsvEyBphAJtJ1Gw",
                                            success: function (response) {
                                                if (response.length < 5000)
                                                    shop.shopImage = getProfileImage(shop.image, "barberShop", "background");
                                                else
                                                    shop.shopImage = "https://maps.googleapis.com/maps/api/streetview?size=400x400&location=" +
                                                                       shop.latitude + "," + shop.longitude + "&key=AIzaSyD2v3QTJPuxDdommKlyJsvEyBphAJtJ1Gw";
                                            }
                                        });
                                    }

                                    $scope.nearbyBarberShops.push(shop);
                                });

                                initialize();
                            }
                        }
                    }, function error(e) {
                        if (e.status == 500 || e.status == 404) {
                        }
                        toggleIonicLoading($ionicLoading, null, false);
                    });

                    function initialize() {
                        map = new google.maps.Map(document.getElementById("maps"), {
                            center: new google.maps.LatLng(position.coords.latitude /*38.643517*/, position.coords.longitude /*-77.260843*/),
                            zoom: 8
                        });

                        var request = {
                            location: new google.maps.LatLng(position.coords.latitude /*38.643517*/, position.coords.longitude /*-77.260843*/),
                            //keyword: 'barber shop',
                            query: 'barber shop',
                            rankBy: google.maps.places.RankBy.DISTANCE,
                            types: ['hair_care'],
                            //key: places
                            radius: 1000
                        };

                        var service = new google.maps.places.PlacesService(map);

                        service.textSearch(request, function (results, status) {
                            if (status == google.maps.places.PlacesServiceStatus.OK) {
                                if (results && results.length > 0) {
                                    
                                    $scope.newResults = [];

                                    if ($scope.nearbyBarberShops != null && $scope.nearbyBarberShops.length > 0) {
                                        var found = false;
                                            
                                        for (var j = 0; j < results.length; j++) {
                                            var goog = results[j];

                                            for (var i = 0; i < $scope.nearbyBarberShops.length; i++) {
                                                var nearby = $scope.nearbyBarberShops[i];
                                                
                                                if (goog.name != nearby.shopName && goog.geometry.location.k != nearby.latitude
                                                    && (goog.geometry.location.A != null ? goog.geometry.location.A : goog.geometry.location.D) != nearby.longitude
                                                    && formatAddress(goog.formatted_address, "Street") != nearby.street
                                                    ){
                                                    found = false;
                                                } else {
                                                    found = true;
                                                    break;
                                                }
                                            }
                                            
                                            if (!found) {
                                                $scope.newResults.push(goog);
                                            }
                                                found = false;
                                        }
                                    } else
                                        $scope.newResults = results;

                                   // $scope.$ionicPopup = $ionicPopup;
                                    $scope.$cordovaDialogs = $cordovaDialogs;
                                    //$scope.getUser();
	                           
                                    if ($scope.nearbyBarberShops != null && $scope.nearbyBarberShops.length > 0)
                                        renderNearbyBarberShops($scope.nearbyBarberShops, $scope, $filter, { lat: position.coords.latitude, lon: position.coords.longitude });

                                    var counter = 0;

                                    angular.forEach($scope.newResults, function (goog, key) {

                                        goog.shopImage = "";

                                        $.ajax({
                                            url: "https://maps.googleapis.com/maps/api/streetview?size=400x400&location=" +
                                                  goog.geometry.location.k + "," + (goog.geometry.location.A != null ? goog.geometry.location.A : goog.geometry.location.D) + "&key=AIzaSyD2v3QTJPuxDdommKlyJsvEyBphAJtJ1Gw",
                                            success: function (response) {
                                                if (response.length < 5000)
                                                    goog.shopImage = new Date().getHours() >= 15 ? "images/skylineday.jpg" : "images/skylinenight.jpg";
                                                else
                                                    goog.shopImage = "https://maps.googleapis.com/maps/api/streetview?size=400x400&location=" +
                                                                       goog.geometry.location.k + "," + (goog.geometry.location.A != null ? goog.geometry.location.A : goog.geometry.location.D) + "&key=AIzaSyD2v3QTJPuxDdommKlyJsvEyBphAJtJ1Gw";

                                                counter++;

                                                if(counter == $scope.newResults.length)
                                                    $scope.playEffect();
                                            }
                                        });
                                    });

                                    renderBarberShops($scope.newResults, $scope, { lat: position.coords.latitude, lon: position.coords.longitude });
                                }
                            }

                            //Waves.displayEffect();
                            //setTimeout(function () {
                            //    Mi.motion.blindsDown({
                            //        selector: '.card'
                            //    });
                            //    Mi.motion.blindsDown({
                            //        selector: '.animate-blinds > *'
                            //    });
                            //}, 500);
                            
	                   
                            //removeLoadingBar();
                            toggleIonicLoading($ionicLoading, null);
                        });
                    }

                    }, function (err) {
                    });

	           //google.maps.event.addDomListener(window, 'load', initialize);
	       }
	       $scope.playEffect = function()
	       {
                setTimeout(function () {
                    ionic.material.motion.blinds();
                }, 500);
	       }
	       $scope.getUser = function () {
	           toggleIonicLoading($ionicLoading, "Loading shops...", true, false, "assertive");
	           
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

                       $scope.gatherNearByBarberShops();

                       //showNavigation("search");
                   }, function error(e) {
                       if (e.status == 500 || e.status == 404) {
                           toggleIonicLoading($ionicLoading, null, false);
                       }
                   });
	       }
	       $scope.createBarberShop = function (shop) {
	           $scope.shopInfo = MbsAPI.createBarberShop({
	               call: "barbershop/create", values: $scope.mbsProfileID,
	               shopName: shop.name, totalBarbers: 0, owner: shop.isOwner ? $scope.mbsDisplayName : "", phoneNumber: shop.phoneNumber,
	               email: "", dateEstablished: "", street: formatAddress(shop.formatted_address, "Street"),
	               city: formatAddress(shop.formatted_address, "City"), stateProvince: formatAddress(shop.formatted_address, "State"),
	               addressType: "address_type_barber_shop", latitude: shop.geometry.location.k, longitude: shop.geometry.location.A != null ? shop.geometry.location.A : shop.geometry.location.D,
	               isCustomer: shop.isCustomer, sunday: shop.sunday != undefined ? shop.sunday : null, monday: shop.monday != undefined ? shop.monday : null,
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

                               if (isBarber($scope.mbsAccountType)) {
                                   if ($scope.barberInfo && type == "BarberSetup")
                                   {
                                       $scope.currentBarber.normalTimeIn = $scope.barberInfo.normalTimeIn;
                                       $scope.currentBarber.avgCutTime = $scope.barberInfo.avgCutTime;
                                       $scope.currentBarber.yearsOfExperience = $scope.barberInfo.yearsOfExperience;
                                       $scope.currentBarber.acceptsAppointments = $scope.barberInfo.acceptsAppointments;
                                       $scope.currentBarber["isOwner"] = shop.isOwner;
                                       $scope.currentBarber["isFreelancer"] = false;

                                       $scope.barberInfo = null; 

                                       $ionicNavBarDelegate.showBackButton(true);                                       
                                   }

                                   $scope.currentBarber.barberShopID = userShop.barberShopID

                                   $scope.updateBarberInfo();
                               } else
                                   $scope.createBarberShopCustomer(userShop);
                               //remove the list of shops and get the barber shop
                               //profile 
                               //window.location = document.URL.replace("search", "index");
                               $state.go('main');
                           }
                       }
                   }, function error(e) {
                       if (e.status == 500 || e.status == 404) {
                           toggleIonicLoading($ionicLoading, null, false);
                       }
                   });
	       }
	       $scope.createBarberShopCustomer = function (shop) {
	           toggleIonicLoading($ionicLoading, "Setting " + shop.shopName + " as your barber shop...", true, false, "assertive");

	           $scope.customerInfo = MbsAPI.createBarberShop({
	               call: "customer/create", values: $scope.mbsProfileID, barberShopID: shop.barberShopID
	           },
                   function (data) {
                       if (data && data.response.success) {
                           if (data.member) {
                               var userShop = {};

                               toggleIonicLoading($ionicLoading, "Setting barber shop succeeded!", true, true, "balanced");
                               //remove the list of shops and get the barber shop
                               //profile 
                               //window.location = document.URL.replace("search", "index");
                               $state.go('main');
                           }
                       } else
                           toggleIonicLoading($ionicLoading, "could not set " + shop.shopName + " as your barber shop...", true, true, "assertive")
                   }, function error(e) {
                       if (e.status == 500 || e.status == 404) {
                           toggleIonicLoading($ionicLoading, null, false);
                       }
                   });
	       };
	       $scope.handleNearbyShopClicked = function (chosenShop)
	       {
	           if (isBarber($scope.mbsAccountType)) {
	               	$scope.currentBarber.barberShopID = chosenShop.barberShopID;

	               	var confirmPopup = $scope.$cordovaDialogs.confirm("Do you own this shop?",
	                        "Barber Shop Select",
	                        ["Yes", "No"]).then(function (res) {
	                            if (res == 1) {
	                                $scope.currentBarber.isOwner = true;
	                                $scope.updateBarberInfo();
	                            } else {
	                                $scope.currentBarber.isOwner = false;
	                                $scope.updateBarberInfo();
	                            }
	                        });
	            } else
	               	$scope.createBarberShopCustomer(chosenShop);
	       };
	       $scope.newResultsShopClicked = function (chosenShop)
	       {
	            //check for more details on the shop
	            var request = {
	                reference: chosenShop.reference
	            };

	            var service = new google.maps.places.PlacesService(map);
	            service.getDetails(request, function (results, status) {
	                if (status == google.maps.places.PlacesServiceStatus.OK) {
	                    //update the shop information
	                    chosenShop.phoneNumber = results.formatted_phone_number;
	                    if (results.website)
	                        chosenShop.website = results.website;
	                    if (results.opening_hours) {
	                        for (var i = 0; i < results.opening_hours.periods.length; i++) {
	                            var hours = results.opening_hours.periods[i];
	                            var allDay = false;

	                            if (!hours.close)
	                                allDay = true;

	                            switch (i) {
	                                case 0:
	                                    chosenShop.sunday = allDay == true ? "Open All Day" :
                                        getReadableGoogleHours(hours.open) + " - " + getReadableGoogleHours(hours.close);
	                                    break;
	                                case 1:
	                                    chosenShop.monday = allDay == true ? "Open All Day" :
                                        getReadableGoogleHours(hours.open) + " - " + getReadableGoogleHours(hours.close);
	                                    break;
	                                case 2:
	                                    chosenShop.tuesday = allDay == true ? "Open All Day" :
                                        getReadableGoogleHours(hours.open) + " - " + getReadableGoogleHours(hours.close);
	                                    break;
	                                case 3:
	                                    chosenShop.wednesday = allDay == true ? "Open All Day" :
                                        getReadableGoogleHours(hours.open) + " - " + getReadableGoogleHours(hours.close);
	                                    break;
	                                case 4:
	                                    chosenShop.thursday = allDay == true ? "Open All Day" :
                                        getReadableGoogleHours(hours.open) + " - " + getReadableGoogleHours(hours.close);
	                                    break;
	                                case 5:
	                                    chosenShop.friday = allDay == true ? "Open All Day" :
                                        getReadableGoogleHours(hours.open) + " - " + getReadableGoogleHours(hours.close);
	                                    break;
	                                case 6:
	                                    chosenShop.saturday = allDay == true ? "Open All Day" :
                                        getReadableGoogleHours(hours.open) + " - " + getReadableGoogleHours(hours.close);
	                                    break;
	                            }
	                        }
	                    }
	                }

	                if (isBarber($scope.mbsAccountType)) {
	                    chosenShop.isCustomer = false;

	                    var confirmPopup = $scope.$cordovaDialogs.confirm("Do you own this shop?",
                            "Barber Shop Select",
                            ["Yes", "No"]).then(function (res) {
                                if (res == 1) {
                                    chosenShop.isOwner = true;

                                    $scope.createBarberShop(chosenShop);
                                }
                                else {
                                    chosenShop.isOwner = false;

                                    $scope.createBarberShop(chosenShop);
                                }
                            });
	                } else {
	                    chosenShop.isCustomer = true;
	                    chosenShop.isOwner = false;

	                    $scope.createBarberShop(chosenShop);
	                }
	            });
	       };
	       $scope.handleFreelanceClicked = function ()
	       {
	           $scope.currentBarber.isOwner = false;
	           $scope.barberInfo.isFreelancer = true;
	           $scope.currentBarber.barberShopID = 0;

	           $scope.updateBarberInfo();
	       }
	       $scope.updateBarberInfo = function(){	    
	    	   
	    	toggleIonicLoading($ionicLoading, "Saving barber shop info", true, false, "assertive");
	    	
    	   if($scope.barberInfo != null)
    	   {
	    	   //postStatusMessage("Saving barber shop info", "info");	    	   
		    	   $scope.updateBarberInfo = MbsAPI.updateBarberInfo({
		    		   call: "barber/save/barberinfo", values: $scope.barberInfo.barberID,
		    		   normalTimeIn: $scope.barberInfo.normalTimeIn, yearsOfExperience: $scope.barberInfo.yearsOfExperience,
		    		   avgCutTime: $scope.barberInfo.avgCutTime, acceptsAppointments: $scope.barberInfo.acceptsAppointments,
		    		   profileID: $scope.mbsProfileID, barberShopID: $scope.currentBarber.barberShopID, owner: $scope.currentBarber.isOwner,
		    		   dateCreated: createJavaDate($scope.mbsDateCreated), displayName: $scope.mbsDisplayName, isFreeLancer: $scope.barberInfo.isFreelancer
		    	   }, 
		    	   	function(data){
		    		   if(data && data.response.success)
	    			   {
		    			   
		    			   //updateStatusMessage("Barber info saved successfully", "success");
		    			   toggleIonicLoading($ionicLoading, "Barber shop info saved successfully", true, true, "balanced");
		    			   
	                       //getPageView("search.html", "index.html", null);
		    			   $state.go('main');
	    			   }else	    		   
	    				   //updateStatusMessage("Could not save barber info", "error");
	    				   toggleIonicLoading($ionicLoading, "Could not save barber shop info", true, true, "assertive");
		    	   	}, function error(e) {
		    	   	    if (e.status == 500 || e.status == 404) {
		    	   	        toggleIonicLoading($ionicLoading, null, false);
		    	   	    }
		    	   	});
    	   		}else
	    		   {
		    		   $scope.updateBarberInfo = MbsAPI.updateBarberInfo({
			    		   call: "barber/save/barberinfo", values: $scope.currentBarber.barberID,
			    		   normalTimeIn: $scope.currentBarber.normalTimeIn, yearsOfExperience: $scope.currentBarber.yearsOfExperience,
			    		   avgCutTime: $scope.currentBarber.avgCutTime, acceptsAppointments: $scope.currentBarber.acceptsAppointments,
			    		   profileID: $scope.mbsProfileID, barberShopID: $scope.currentBarber.barberShopID, owner: $scope.currentBarber.isOwner,
			    		   dateCreated: createJavaDate($scope.mbsDateCreated), displayName: $scope.mbsDisplayName, isFreeLancer: $scope.currentBarber.isFreelancer
			    	   }, 
			    	   	function(data){
			    		   if(data && data.response.success)
		    			   {			    			   
			    			   //updateStatusMessage("Barber info saved successfully", "success");
			    			   toggleIonicLoading($ionicLoading, "Barber shop info saved successfully", true, true, "balanced");
			    			   
		                       //getPageView("search.html", "index.html", null);
			    			   $state.go('main');
		    			   }else	    		   
		    				   //updateStatusMessage("Could not save barber info", "error");
		    				   toggleIonicLoading($ionicLoading, "Could not save barber shop info", true, true, "assertive");
			    	   	}, function error(e) {
			    	   	    if (e.status == 500 || e.status == 404) {
			    	   	        toggleIonicLoading($ionicLoading, null, false);
			    	   	    }
			    	   	});
	    		   }
	       }

	       getUserData($scope);
	       getBarberData($scope);
	       
	       if(type == "BarberSetup")
    	   {
	    	   $ionicNavBarDelegate.showBackButton(false);
    	   }
	       
	       $scope.getUser();

	       $scope.handleNotificationsClick = function () {
	           //getUserNotifications($scope, $ionicPopup);
	           $state.go('notifications');
	       }
	       $scope.handleNotificationClicked = function (notification) {
	           if (notification.title == "New Barber Shop Image") {
	               $state.go('gallery', { userID: notification.barberShopID, type: 'BarberShop' });
	           } else
	               if (notification.title == "New Customer") {
	                   $state.go('userprofile', { profileID: notification.profileID });
	               }
	       }
	       $rootScope.$on("HasNotifications", function () {
	           $scope.hasNotifications = true;
	       });
	   }])
	   .controller('barberSearchController', ['$scope', 'MbsAPI', '$ionicLoading', '$state', '$stateParams', '$ionicPopup', '$ionicNavBarDelegate', '$filter', '$rootScope', function ($scope, MbsAPI, $ionicLoading, $state, $stateParams, $ionicPopup, $ionicNavBarDelegate, $filter, $rootScope) {
	       var type = $stateParams.type;
	       
	       $scope.screenHeight = (screen.height - (hasAds ? 50 : 0)) + "px";
	       $scope.hasNotifications = false;
	       $scope.barbersSearch = [];

	       //gather the users profile information
	      
	       $scope.getUser = function () {
	           //toggleIonicLoading($ionicLoading, "Loading shops...", true, false, "assertive");

	           $scope.userInfo = MbsAPI.getUserProfile({
	               call: "login/gather", values: $scope.mbsProfileID,
	               accountType: getAccountType($scope.mbsAccountType)
	           },
                   function (data) {
                       if (data && data.response.success) {
                           if (data.barber)
                               buildBarberProfile(data.barber, $scope);
                       } else {
                           //error getting user data
                       }
                   }, function error(e) {
                       if (e.status == 500 || e.status == 404) {
                           toggleIonicLoading($ionicLoading, null, false);
                       }
                   });
	       };
	       $scope.searchBarbers = function () {
	           //toggleIonicLoading($ionicLoading, "Searching for barbers...", true, false, "assertive");

	           if ($("#barberName").val().length > 0 && $("#barberName").val() != "") {
	               $("#searchingText").css("display", "block");

	               MbsAPI.getBarbers({
	                   call: "search/barber", values: $scope.mbsProfileID,
	                   displayName: $("#barberName").val()
	               },
                       function (data) {
                           if (data && data.response.success) {
                               if (data.member && data.member.length > 0) {
                                   $scope.barbersSearch = [];

                                   if ($("#barberName").val().length > 0 && $("#barberName").val() != "") {
                                       angular.forEach(data.member, function (barber, key) {
                                           if (barber.profile.displayName.substr(0, $("#barberName").val().length).toLowerCase() == $("#barberName").val().toLowerCase())
                                               $scope.barbersSearch.push(buildBarberSearchProfile(barber));
                                       });

                                       //setTimeout(function () {
                                       //    ionic.material.motion.ripple();
                                       //}, 200);
                                   }

                                   $("#searchingText").css("display", "none");
                               } else {
                                   $scope.barbersSearch = [];
                                   $("#searchingText").css("display", "none");
                               }

                               //toggleIonicLoading($ionicLoading, null, false);
                           } else {
                               //error getting user data
                               $("#searchingText").css("display", "none");
                           }
                       }, function error(e) {
                           if (e.status == 500 || e.status == 404) {
                               toggleIonicLoading($ionicLoading, null, false);
                           }
                       });
	           }else
	           {
	               $scope.barbersSearch = [];
	               $("#searchingText").css("display", "none");
	           }
	       }

	       getUserData($scope);

	       $scope.getUser();

	       $scope.loadBarber = function (barber) {
	           //saveViewData();

	           $state.go("barber", { barberID: barber.barberID });
	       };
	       $scope.handleNotificationsClick = function () {
	           //getUserNotifications($scope, $ionicPopup);
	           $state.go('notifications');
	       }
	       $scope.handleNotificationClicked = function (notification) {
	           if (notification.title == "New Barber Shop Image") {
	               $state.go('gallery', { userID: notification.barberShopID, type: 'BarberShop' });
	           } else
	               if (notification.title == "New Customer") {
	                   $state.go('userprofile', { profileID: notification.profileID });
	               }
	       }
	       $rootScope.$on("HasNotifications", function () {
	           $scope.hasNotifications = true;
	       });
	   }])
	   .controller('barberShopController', ['$scope', 'MbsAPI', '$stateParams', '$location', '$state', '$ionicLoading', '$rootScope', '$ionicSideMenuDelegate', '$ionicScrollDelegate', '$timeout', 'WeatherAPI', function ($scope, MbsAPI, $stateParams, $location, $state, $ionicLoading, $rootScope, $ionicSideMenuDelegate, $ionicScrollDelegate, $timeout, WeatherAPI) {
           if($scope.backButtonPressed)
	            getNavData($scope);
           

           $scope.toggleRight = function () {
               $ionicSideMenuDelegate.toggleRight();
           };

	       var searchObject = $location.search();
	       var barberShopID = $stateParams.barberShopID;
	       $scope.hasNotifications = false;

	       $scope.$ionicScrollDelegate = $ionicScrollDelegate;
	       $scope.isHours = true;
	       $scope.isSpecialties = false;
	       $scope.shopImage;
	       $scope.shopAddress; 
	       $scope.shopCityState;
	       $scope.hoursOf;
	       $scope.specialties;
	       $scope.screenHeight = ((screen.height - (hasAds ? 50 : 0)) - 200 - parseInt($("#bBar").css("height"))) + "px";

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
                   }, function error(e) {
                       if (e.status == 500 || e.status == 404) {
                           toggleIonicLoading($ionicLoading, null, false);
                       }
                   });
	       }
	       $scope.getBarberShopDetails = function () {

	           toggleIonicLoading($ionicLoading, "Loading barber shop information", true, false, "assertive");

	           $scope.shopInfo = MbsAPI.getBarberShopDetails({
	               call: "barbershop/gather/details", barberShopID: barberShopID
	           },
                   function (data) {
                       if (data && data.response.success) {
                           if (data.barberShop) {
                               buildBarberShopDetail(data.barberShop, $scope);

                               //WeatherAPI.getCurrentConditions({
                               //    call: "conditions/q/", values: $scope.currentBarberShops[0].address.abbreviatedStateProvince + "/" + $scope.currentBarberShops[0].address.city.replace(" ", "_") + ".json" 
                               //}, function(weatherData){
                               //    if(weatherData)
                               //    {
                               //        $scope.weatherIcon = weatherData.current_observation.icon_url;
                               //    }
                               //});

                               if ($scope.currentBarberShops[0].image && $scope.currentBarberShops[0].image.imageID) {
                                   $scope.shopImage = "url(" + getProfileImage($scope.currentBarberShops[0].image, "barberShop", "background") + ")";

                                   $scope.playEffect();
                               }
                               else {
                                   //var streetView = new google.maps.StreetViewService();

                                   //streetView.getPanoramaByLocation(new google.maps.LatLng($scope.currentBarberShops[0].address.latitude, $scope.currentBarberShops[0].address.longitude), 50, handlePanoResults);
                                   $.ajax({
                                       url: "https://maps.googleapis.com/maps/api/streetview?size=400x400&location=" +
                                             $scope.currentBarberShops[0].address.latitude + "," + $scope.currentBarberShops[0].address.longitude + "&key=AIzaSyD2v3QTJPuxDdommKlyJsvEyBphAJtJ1Gw",
                                       success: function (response) {
                                           if (response.length < 5000)
                                               $scope.shopImage = "url(" + getProfileImage($scope.currentBarberShops[0].image, "barberShop", "background") + ")";
                                           else
                                               $scope.shopImage = "url(" + "https://maps.googleapis.com/maps/api/streetview?size=400x400&location=" +
                                                                  $scope.currentBarberShops[0].address.latitude + "," + $scope.currentBarberShops[0].address.longitude + "&key=AIzaSyD2v3QTJPuxDdommKlyJsvEyBphAJtJ1Gw"
                                                                  + ")";

                                           $scope.playEffect();
                                       }
                                   });
                               }
                               $scope.shopAddress = formatAddressReverse($scope.currentBarberShops[0].address, "Street");
                               $scope.shopCityState = formatAddressReverse($scope.currentBarberShops[0].address, "CityState");
                               $scope.hoursOf = getHoursOfOperation($scope.currentBarberShops[0].hoursOfOperation, false, true, $scope).html();
                              // $scope.specialties = getSpecialties($scope.currentBarberShops[0].barberShopSpecialties).html();
                               $scope.specialties = getSpecialties($scope.currentBarberShops[0].barberShopSpecialties, true, $scope).html();

                               angular.forEach($scope.currentBarberShops[0].barbers, function (barber, key) {
                                   if (barber.profile.image.imageID > 0)
                                       barber.profile.image.defaultImage = barber.profile.image.fileLocation + barber.profile.image.fileName;

                                   barber["barberImage"] = getProfileImage(barber.profile.image, "barber", "avatar");
                                   barber["doesAppointments"] = convertBoolean(barber.acceptsAppointments);
                                   barber["available"] = convertBoolean(barber.barberStatus.isAvailable);
                                   barber["makeAppointment"] = barber.acceptsAppointments == "true" && barber.profile.profileID != $scope.mbsProfileID ? false : true;
                                   barber.ratingCalc = calculateRating(barber.rating.rating, 100);
                               });

                              // var gallery = renderGallery($scope.currentBarberShops[0].images, "#shopGallery");

                              // if (gallery != null)
                               //   $("#shopGallery").append(gallery);
                               
                               handleImages($scope.currentBarberShops[0].images);

                               //$("#shopCustomers").append(renderCustomers($scope.currentBarberShops[0].customers));

                               angular.forEach($scope.currentBarberShops[0].customers, function (customer, key) {
                                   var dateCreated = splitDate(customer.dateCreated);

                                   if (customer.profile.image.imageID > 0)
                                       customer.profile.image.defaultImage = customer.profile.image.fileLocation + customer.profile.image.fileName;

                                   customer["customerImage"] = getProfileImage(customer.profile.image, "profile", "avatar");
                                   customer["customerSince"] = getReadableMonth(dateCreated.getMonth()) + " " + dateCreated.getDate() + ", " + dateCreated.getFullYear();
                               });

                               if ($scope.currentBarberShops[0].barbers.length == 0 && $scope.currentBarberShops[0].customers.length == 0) {
                                   $scope.barberHeight = (screen.height / 2) + "px";
                                   $scope.customerHeight = (screen.height / 2) + "px";
                               } else {
                                   if ($scope.currentBarberShops[0].barbers.length == 0) 
                                       $scope.barberHeight = ((screen.height / 2) - (hasAds ? 50 : 0)) + "px";
                                   else 
                                       $scope.barberHeight = ((screen.height / 2) - (hasAds ? 50 : 0)) + "px";

                                   if ($scope.currentBarberShops[0].customers.length == 0)
                                       $scope.customerHeight = ((screen.height / 2) - 30) + "px";
                                   else
                                       $scope.customerHeight = (screen.height / 2) + "px";
                               }

                               //$timeout(function () {
                               //    ionic.material.motion.slideUp({
                               //        selector: '.slide-up'
                               //    });
                               //}, 300);
                           }
                       }

                       toggleIonicLoading($ionicLoading, null, false);

                   }, function error(e) {
                       if (e.status == 500 || e.status == 404) {
                           toggleIonicLoading($ionicLoading, null, false);
                       }
                   });
	       };
	       $scope.loadBarber = function (barber) {
	           saveViewData();

	           $state.go("barber", { barberID: barber.barberID });
	       };
	       $scope.loadCustomer = function (customer) {
	           saveViewData();

	           $state.go("userprofile", { profileID: customer.profile.profileID });
	       };
	       $scope.loadBarbers = function () {
	           setSideViewData($scope.currentBarberShops[0].barbers);

	           $state.go("sideview", { type: "Barbers" });
	       };
	       $scope.loadClients = function () {
	           setSideViewData($scope.currentBarberShops[0].customers);

	           $state.go("sideview", { type: "Customers" });
	       };
	       $scope.loadImages = function (images) {
	           setImageData(images);

	           saveViewData();

	           $state.go('gallery', { userID: $scope.currentBarberShops[0].barberShopID, type: 'BarberShop' });
	       };
	       $scope.loadAppointment = function (barber) {
	           $state.go('appointment', { barberID: barber.barberID, barberProfileID: barber.profileID });
	       };
           
	       function handlePanoResults(data, status)
	       {
	           if(status == google.maps.StreetViewStatus.OK)
	           {
	               $scope.shopImage = "https://maps.googleapis.com/maps/api/streetview?size=400x400&location=" +
                                       $scope.currentBarberShops[0].address.latitude + "," + $scope.currentBarberShops[0].address.longitude + "&key=AIzaSyD2v3QTJPuxDdommKlyJsvEyBphAJtJ1Gw";

	               //var pano = new google.maps.StreetViewPanorama(document.getElementById("shopImageBack"));

	               //pano.setPano(data.location.pano);

	               //pano.setVisible(true);
	           }else
	               $scope.shopImage = getProfileImage($scope.currentBarberShops[0].image, "barberShop", "background");
	       }

	       getUserData($scope);

	       if ($scope.navData)
	       {
	           $scope.currentBarberShops = $scope.navData.barberShops;

	           $scope.shopImage = getProfileImage($scope.currentBarberShops[0].image, "barberShop", "background");
	           $scope.shopAddress = formatAddressReverse($scope.currentBarberShops[0].address, "Street");
	           $scope.shopCityState = formatAddressReverse($scope.currentBarberShops[0].address, "CityState");
	           $scope.hoursOf = getHoursOfOperation($scope.currentBarberShops[0].hoursOfOperation, false, true, $scope).html();
	           // $scope.specialties = getSpecialties($scope.currentBarberShops[0].barberShopSpecialties).html();
	           $scope.specialties = getSpecialties($scope.currentBarberShops[0].barberShopSpecialties, true, $scope).html();
	       }else
	        $scope.getBarberShopDetails();

	       $scope.handleNotificationsClick = function () {
	           //getUserNotifications($scope, $ionicPopup);
	           saveViewData();
	           $state.go('notifications');
	       }
	       $scope.handleNotificationClicked = function (notification) {
	           saveViewData();

	           if (notification.title == "New Barber Shop Image") {
	               $state.go('gallery', { userID: notification.barberShopID, type: 'BarberShop' });
	           } else
	               if (notification.title == "New Customer") {
	                   $state.go('userprofile', { profileID: notification.profileID });
	               }
	       }
	       $scope.backClicked = function()
	       {
	           $rootScope.$broadcast("HasNotifications");
	       }
	       $rootScope.$on("HasNotifications", function () {
	           $scope.hasNotifications = true;
	       });
	       $rootScope.$on("backButtonPressed", function () {
	           $scope.backButtonPressed = true;
	       });

	       function saveViewData() {
	           /*setNavData({
	               barberShops: $scope.currentBarberShops
	           });*/
	       }
	       $scope.playEffect = function()
	       {
	           setTimeout(function () {
	               ionic.material.motion.slideUp({
	                   selector: ".slide-up"
	               });
	           }, 500);
	       }
	       $scope.$on("$ionicView.enter", function () {
	           getBarberShopProfileImage($scope);
	           clearBarberShopProfileImage();

	           if ($scope.newBarberShopImage) {
	               if ($scope.newBarberShopImage.imageID > 0) {
	                   $scope.newBarberShopImage.defaultImage = $scope.newBarberShopImage.fileLocation + $scope.newBarberShopImage.fileName;

	                   $scope.shopImage = "url(" + getProfileImage($scope.newBarberShopImage, "barberShop", "background") + ")";

	                   $scope.playEffect();
	               }
	               else {
	                   $.ajax({
	                       url: "https://maps.googleapis.com/maps/api/streetview?size=400x400&location=" +
                                 $scope.currentBarberShops[0].address.latitude + "," + $scope.currentBarberShops[0].address.longitude + "&key=AIzaSyD2v3QTJPuxDdommKlyJsvEyBphAJtJ1Gw",
	                       success: function (response) {
	                           if (response.length < 5000)
	                               $scope.shopImage = "url(" + getProfileImage($scope.newBarberShopImage, "barberShop", "background") + ")";
	                           else
	                               $scope.shopImage = "url(" + "https://maps.googleapis.com/maps/api/streetview?size=400x400&location=" +
                                                      $scope.currentBarberShops[0].address.latitude + "," + $scope.currentBarberShops[0].address.longitude + "&key=AIzaSyD2v3QTJPuxDdommKlyJsvEyBphAJtJ1Gw"
                                                      + ")";

	                           $scope.playEffect();
	                       }
	                   });
	               }
	           }

	           $scope.newBarberShopImage = null;
	       });
	   }])
	   .controller('barberController', ['$scope', 'MbsAPI', '$stateParams', '$location', '$state', '$ionicLoading', '$ionicPopup', '$rootScope', '$ionicSideMenuDelegate', '$cordovaDialogs', '$ionicScrollDelegate', function ($scope, MbsAPI, $stateParams, $location, $state, $ionicLoading, $ionicPopup, $rootScope, $ionicSideMenuDelegate, $cordovaDialogs, $ionicScrollDelegate) {
	       
	       var searchObject = $location.search();
	       var barberID = $stateParams.barberID;
	       $scope.hasNotifications = false;
	       
	       $scope.$ionicScrollDelegate = $ionicScrollDelegate;
	       $scope.barberCon = (screen.width / 9) + "px";
	       $scope.barberImage;
	       $scope.isAvailable; 
	       $scope.isAppointments;
	       $scope.isAppointment;
	       $scope.isClient;
	       $scope.isVacationing;
	       $scope.vacationPeriod;
	       $scope.isInfo = true;
	       $scope.isSpecialties = false;
	       $scope.isSchedule = false;
	       $scope.screenHeight = ((screen.height - (hasAds ? 50 : 0)) - 220 - parseInt($("#bBar").css("height"))) + "px";

	       $scope.toggleRight = function () {
	           $ionicSideMenuDelegate.toggleRight();
	       };

	       $scope.backClicked = function () {
	           $rootScope.$broadcast("HasNotifications");
	       }
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
                   }, function error(e) {
                       if (e.status == 500 || e.status == 404) {
                           toggleIonicLoading($ionicLoading, null, false);
                       }
                   });
	       };
	       $scope.getBarberDetails = function () {
	    	   toggleIonicLoading($ionicLoading, "Loading barber information...", true, false, "assertive");
	    	   
	           $scope.shopInfo = MbsAPI.getBarberShopDetails({
	               call: "barber/gather/details", barberID: barberID
	           },
                   function (data) {
                       if (data && data.response.success) {
                           if (data.member) {
                               buildBarberProfile(data.member, $scope);

                               $scope.barberImage = getProfileImage($scope.currentBarber.profile.image, "barber", "avatar");
                               $scope.isAvailable = convertBoolean($scope.currentBarber.barberStatus.isAvailable);
                               $scope.isAppointments = convertBoolean($scope.currentBarber.acceptsAppointments);
                    	       $scope.isAppointment = $scope.currentBarber.acceptsAppointments == "false" || $scope.currentBarber.profile.profileID == $scope.mbsProfileID ? true : false;                               
                    	       $scope.isVacationing = convertBoolean($scope.currentBarber.barberStatus.isOnVacation);
                    	       //$scope.vacationingClass = $scope.isVacationing == 'No' ?  "button button-icon icon ion-record" : "button button-balanced";
                    	       $scope.vacationColor = $scope.isVacationing == 'No' ? "#ef473a" : "green";

                    	       if($scope.currentBarber.barberStatus.vacationStartDate && $scope.currentBarber.barberStatus.vacationEndDate)
                        	   {
                    	    	   $scope.vacationPeriod = formatDateNoTime($scope.currentBarber.barberStatus.vacationStartDate) + " - " + 
                            	   					formatDateNoTime($scope.currentBarber.barberStatus.vacationEndDate)
                    	       } else
                    	       {
                    	           $scope.vacationPeriod = "N/A";
                    	       }
                    	       
                    	       $scope.hoursOf = getHoursOfOperation($scope.currentBarber.barberSchedule, false, true, $scope).html();
                    	       //$scope.specialties = getSpecialties($scope.currentBarber.barberSpecialties).html();
                    	       $scope.specialties = getSpecialties($scope.currentBarber.barberSpecialties, true, $scope).html();
                               $scope.currentBarber.ratingCalc = calculateRating($scope.currentBarber.rating.rating, 100);
                               
                               $scope.hideRating = $scope.currentBarber.profileID == $scope.mbsProfileID ? true : false; 
                               
                               /*var gallery = renderGallery($scope.currentBarber.barberImages, "#barberGallery");
                               
                               if(gallery != null)
                            	   $("#barberGallery").append(gallery);*/

                               angular.forEach($scope.currentBarber.barberImages, function (image, key) {
                                   image["imageSrc"] = IMAGE_ENDPOINT + image.fileLocation + image.fileName;
                               });
                               
                               //$("#barberClients").append(renderClients($scope.currentBarber.barberClients));

                               angular.forEach($scope.currentBarber.barberClients, function (client, key) {
                                   var dateCreated = splitDate(client.dateCreated);

                                   if (client.profile.image.imageID > 0)
                                       client.profile.image.defaultImage = client.profile.image.fileLocation + client.profile.image.fileName;

                                   client["clientImage"] = getProfileImage(client.profile.image, "profile", "avatar");
                                   client["clientSince"] = getReadableMonth(dateCreated.getMonth()) + " " + dateCreated.getDate() + ", " + dateCreated.getFullYear();

                                   if (client.profile.profileID == $scope.mbsProfileID || client.profile.profileID == $scope.currentBarber.profile.profileID
                                       || $scope.currentBarber.profile.profileID == $scope.mbsProfileID)
                                       $scope.isClient = true;
                               });

                               if ($scope.currentBarber.backgroundImage && $scope.currentBarber.backgroundImage.imageID) {
                                   //$scope.currentBarber.barberShop.image.defaultImage = $scope.currentBarber.barberShop.image.fileLocation + $scope.currentBarber.barberShop.image.fileName;

                                   $scope.shopImage = "url(" + getProfileImage($scope.currentBarber.backgroundImage, "barber", "background") + ")";

                                   $scope.playEffect();
                               }
                               else {
                                   //$.ajax({
                                   //    url: "https://maps.googleapis.com/maps/api/streetview?size=400x400&location=" +
                                   //          $scope.currentBarber.barberShop.address.latitude + "," + $scope.currentBarber.barberShop.address.longitude + "&key=AIzaSyD2v3QTJPuxDdommKlyJsvEyBphAJtJ1Gw",
                                   //    success: function (response) {
                                   //        if (response.length < 5000)
                                               $scope.shopImage = "url(" + getProfileImage($scope.currentBarber.backgroundImage, "barber", "background") + ")";
                                           //else
                                           //    $scope.shopImage = "url(" + "https://maps.googleapis.com/maps/api/streetview?size=400x400&location=" +
                                           //                       $scope.currentBarber.barberShop.address.latitude + "," + $scope.currentBarber.barberShop.address.longitude + "&key=AIzaSyD2v3QTJPuxDdommKlyJsvEyBphAJtJ1Gw"
                                           //                       + ")";
                               
                                           $scope.playEffect();
                                   //});
                               }

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
                           
                           toggleIonicLoading($ionicLoading, null);
                       }else
                    	   toggleIonicLoading($ionicLoading, null);
                   }, function error(e) {
                       if (e.status == 500 || e.status == 404) {
                           toggleIonicLoading($ionicLoading, null, false);
                       }
                   });
	       };
	       $scope.createBarberRating = function (ratedValue) {
	    	   toggleIonicLoading($ionicLoading, "Rating barber...", true, false, "assertive");
	    	   
	    	   var isUp = false;
	    	   var currentRating = $scope.currentBarber.rating.rating;
	    	   var count = 0, rateTimes = calculateRatingValue(ratedValue); 
	    	   
	    	   if(parseInt(ratedValue) >= parseInt(currentRating))
	    		   isUp = true;
	    	   
	    	   if (($scope.currentBarber.rating.ratingID == null || $scope.currentBarber.rating.ratingID == undefined || $scope.currentBarber.rating.ratingID == 0)) {
	    	       $scope.barberRatingInfo = MbsAPI.createBarberRating({
	    	           call: "rating/barber/create", values: $scope.mbsProfileID,
	    	           upCount: isUp ? 1 : 0, downCount: isUp ? 0 : 1,
	    	           barberID: $scope.currentBarber.barberID, rating: $scope.currentBarber.rating.rating
	    	       },
                       function (data) {
                           if (data && data.response.success) {
                                   $scope.currentBarber.rating.ratingID = data.member.ratingID;
                                   $scope.currentBarber.rating.rating = data.member.rating;
                                   $scope.currentBarber.rating.downCount = data.member.downCount;
                                   $scope.currentBarber.rating.upCount = data.member.upCount;
                                   $scope.currentBarber.ratingCalc = calculateRating(data.member.rating, 100);

                                   if (rateTimes > 1)
                                       finishRatingBarber(1, isUp, rateTimes, 1);
                                   else {
                                       $scope.cancelRateBarber();

                                       toggleIonicLoading($ionicLoading, "Barber rated successfully!", true, true, "balanced");
                                   }
                           } else {
                               toggleIonicLoading($ionicLoading, "Could not rate barber", true, true, "assertive");
                           }

                       }, function error(e) {
                           if (e.status == 500 || e.status == 404) {
                               toggleIonicLoading($ionicLoading, null, false);
                           }
                       });
	    	   } else
	    	       finishRatingBarber(0, isUp, rateTimes, 0);
	       };

	       function finishRatingBarber(i, isUp, rateTimes, count)
	       {
	           for (i; i < rateTimes; i++) {
	               if ($scope.currentBarber.rating.ratingID != null) {
	                       $scope.barberRatingInfo = MbsAPI.createBarberRating({
	                           call: "rating/barber/update", values: $scope.mbsProfileID,
	                           upCount: isUp ? 1 : 0, downCount: isUp ? 0 : 1,
	                           barberID: $scope.currentBarber.barberID, rating: $scope.currentBarber.rating.rating,
	                           ratingID: $scope.currentBarber.rating.ratingID
	                       },
    		                   function (data) {
    		                       if (data && data.response.success) {
    		                           count++;

    		                           if (count == i) {
    		                               $scope.currentBarber.rating.rating = data.member.rating;
    		                               $scope.currentBarber.rating.downCount = data.member.downCount;
    		                               $scope.currentBarber.rating.upCount = data.member.upCount;
    		                               $scope.currentBarber.ratingCalc = calculateRating(data.member.rating, 100);
    		                               $scope.cancelRateBarber();

    		                               toggleIonicLoading($ionicLoading, "Barber rated successfully!", true, true, "balanced");
    		                           }
    		                       } else {
    		                           toggleIonicLoading($ionicLoading, "Could not rate barber", true, true, "assertive");
    		                       }

    		                   }, function error(e) {
    		                       if (e.status == 500 || e.status == 404) {
    		                           toggleIonicLoading($ionicLoading, null, false);
    		                       }
    		                   });
	                   }
	           }
	       }

	       $scope.createClient = function () {
	           toggleIonicLoading($ionicLoading, "Setting " + $scope.currentBarber.profile.displayName + " as your barber..", true, false, "assertive");

	           MbsAPI.createBarberClient({
	               call: "client/create", values: $scope.mbsProfileID,
	               profileID: $scope.mbsProfileID, barberID: $scope.currentBarber.barberID,
                   barberProfileID: $scope.currentBarber.profile.profileID, displayName: $scope.mbsDisplayName
	           },
                   function (data) {
                       if (data && data.response.success) {
                           var newClient = {};

                           var dateCreated = splitDate(data.member.dateCreated);

                           newClient.clientSince = getReadableMonth(dateCreated.getMonth()) + " " + dateCreated.getDate() + ", " + dateCreated.getFullYear();
                           newClient.profile = {
                               profileID: $scope.mbsProfileID,
                               displayName: $scope.mbsDisplayName,
                               image:{
                                   defaultImage: $scope.mbsProfileImage
                               }
                           }
                           newClient.clientImage = $scope.mbsProfileImage;

                           $scope.isClient = true;

                           $scope.currentBarber.barberClients.push(newClient);

                           /*

                           if (client.profile.image.imageID > 0)
                               client.profile.image.defaultImage = client.profile.image.fileLocation + client.profile.image.fileName;

                           client["clientImage"] = getProfileImage(client.profile.image, "profile");*/

                           toggleIonicLoading($ionicLoading, "Setting barber succeeded!", true, true, "balanced");
                       } else {
                           //error getting user data
                           toggleIonicLoading($ionicLoading, "count not set " + $scope.currentBarber.profile.displayName + " as your barber" , true, true, "assertive");
                       }
                   }, function error(e) {
                       if (e.status == 500 || e.status == 404) {
                           toggleIonicLoading($ionicLoading, null, false);
                       }
                   });
	       };
	       $scope.rateBarber = function()
	       {
	    	   $("#ratingContainer").css("display", "none");
	    	   $("#ratingEditContainer").css("display", "block");
	       };
	       $scope.cancelRateBarber = function()
	       {
	    	   $("#ratingEditContainer").css("display", "none");
	    	   $("#ratingContainer").css("display", "block");
	       };
	       
	       $scope.loadAppointment = function (barber) {
	           //window.location = document.URL.substring(0, document.URL.indexOf("?")).replace("barber.html", "appointment.html?barberID=" + barberID);
	           $state.go('appointment', { barberID: barber.barberID, barberProfileID: barber.profileID, apptType: "Client" });
	       };
	       $scope.loadClient = function (client) {
	           if (client.profile.profileID == $scope.mbsProfileID)
	           {
	               if (getAccountType($scope.mbsAccountType) == "Customer")
	                   $state.go('user', { profileID: $scope.mbsProfileID });
	               else
	                   $state.go('barberprofile', { barberID: $scope.currentBarber.barberID });
	           }else
	                $state.go("userprofile", { profileID: client.profile.profileID });
	       };
	       //$scope.loadBarberShops = function () {
	       //    setSideViewData($scope.currentBarber.barberShop);

	       //    $state.go("sideview", { type: "Barbers" });
	       //};
	       $scope.loadClients = function () {
	           setSideViewData($scope.currentBarber.barberClients);

	           $state.go("sideview", { type: "Clients" });
	       };
	       $scope.loadImages = function (images) {
	           setImageData(images);

	           $state.go('gallery', { userID: $scope.currentBarber.barberID, type: 'Barber' });
	       };
	       
	       $("#barberRating").change(function(){
	    	   var sliderValue = $(this).val();
	    	   
	    	   var confirmPopup = $cordovaDialogs.confirm("Are you sure you want to rate your barber at " + $(this).val() + "%?",
        			"Barber Rating", ["Rate", "No"]).then(function(res) 
				{
        		     if(res == 1) 
        		     {
        		    	$scope.createBarberRating(sliderValue);
        		     }
        		});   
	       });

	       getUserData($scope);

	       $scope.getBarberDetails();

	       $scope.handleNotificationsClick = function () {
	           //getUserNotifications($scope, $ionicPopup);
	           $state.go('notifications');
	       }
	       $scope.handleNotificationClicked = function (notification) {
	           if (notification.title == "New Barber Shop Image") {
	               $state.go('gallery', { userID: notification.barberShopID, type: 'BarberShop' });
	           } else
	               if (notification.title == "New Customer") {
	                   $state.go('userprofile', { profileID: notification.profileID });
	               }
	       }
	       $rootScope.$on("HasNotifications", function () {
	           $scope.hasNotifications = true;
	       });
	       $scope.playEffect = function()
	       {
	           setTimeout(function () {
	               ionic.material.motion.slideUp({
	                   selector: ".slide-up"
	               });
	           }, 500);
	       }
	   }])	   
	   .controller('profileController', ['$scope', 'MbsAPI', '$stateParams', '$location', '$ionicLoading', '$state', '$rootScope', '$ionicSideMenuDelegate', function ($scope, MbsAPI, $stateParams, $location, $ionicLoading, $state, $rootScope, $ionicSideMenuDelegate) {
	       
		   var searchObject = $location.search();
		   var profileID = $stateParams.profileID, userInfo = {};
		   $scope.hasNotifications = false;

		   $scope.userImage;
	       $scope.isAvailable; 
	       $scope.isAppointments;
	       $scope.isAppointment;
	       $scope.isVacationing;
	       $scope.vacationPeriod;
	       $scope.memberSince;
	       $scope.screenHeight = (screen.height - (hasAds ? 50 : 0)) + "px";

	       $scope.toggleRight = function () {
	           $ionicSideMenuDelegate.toggleRight();
	       };
		   
	       $scope.getUser = function () {

	           //showLoadingBar("Loading Profile...");
	           toggleIonicLoading($ionicLoading, "Loading profile...", true, false, "assertive");

	           $scope.profileInfo = MbsAPI.getUserProfile({
	               call: "profile/gather/details", profileID: profileID
	           },
                   function (data) {
                       if (data && data.response.success) {
                           buildProfile(data, $scope);
                           buildBarberShop(data.barberShop, $scope);

                           var dateCreated = splitDate($scope.currentProfile.dateCreated);

                           $scope.userImage = getProfileImage($scope.currentProfile.image, "profile", "avatar");
                           $scope.memberSince = getReadableMonth(dateCreated.getMonth()) + " " + dateCreated.getDate() + ", " +
        	               						 dateCreated.getFullYear();
                           /*var gallery = renderGallery($scope.currentProfile.images, "#userGallery");
                           
                           if(gallery != null)
                        	   $("#userGallery").append(gallery);*/

                           handleImages($scope.currentProfile.images);

                           /*$("#userShops").append(renderUserShops($scope));*/
                       } else {
                           //error getting user data
                       }

                       //showNavigation("search");

                       //removeLoadingBar();
                       toggleIonicLoading($ionicLoading, null, false);
                   }, function error(e) {
                       if (e.status == 500 || e.status == 404) {
                           toggleIonicLoading($ionicLoading, null, false);
                       }
                   });
	       };

	       $scope.editUserInfo = function () {
	           if ($scope.currentProfile) {
	               $("#userInfoStatic").css("display", "none");
	               $("#userInfoEdit").css("display", "block");

	               $("#newDisplayName").val($scope.currentProfile.displayName);
	               userInfo.displayName = $scope.currentProfile.displayName;
	               $("#newFirstName").val($scope.currentProfile.firstName);
	               userInfo.firstName = $scope.currentProfile.firstName;
	               $("#newLastName").val($scope.currentProfile.lastName);
	               userInfo.lastName = $scope.currentProfile.lastName;
	               $("#newPhoneNumber").val($scope.currentProfile.phoneNumber);
	               userInfo.phoneNumber = $scope.currentProfile.phoneNumber;
	           }
	       }
	       $scope.cancelEditUserInfo = function () {
	           $("#userInfoStatic").css("display", "block");
	           $("#userInfoEdit").css("display", "none");
	       }
	       $scope.updateUserInfo = function () {
	           toggleIonicLoading($ionicLoading, "Saving user info", true, false, "assertive");

	           $scope.updateUserInfo = MbsAPI.updateUserInfo({
	               call: "profile/save/userinfo", values: $scope.mbsProfileID,
	               displayName: $("#newDisplayName").val(), firstName: $("#newFirstName").val(),
	               lastName: $("#newLastName").val(), phoneNumber: $("#newPhoneNumber").val(),
	               dateCreated: createJavaDate($scope.mbsDateCreated)
	           },
	    	   	function (data) {
	    	   	    if (data && data.response.success) {
	    	   	        toggleIonicLoading($ionicLoading, "User info saved successfully", true, true, "balanced");

	    	   	        $scope.currentProfile.displayName = $("#newDisplayName").val();
	    	   	        $scope.currentProfile.firstName = $("#newFirstName").val();
	    	   	        $scope.currentProfile.lastName = $("#newLastName").val();
	    	   	        $scope.currentProfile.phoneNumber = $("#newPhoneNumber").val();
	    	   	        $scope.mbsDisplayName = userInfo.displayName;

	    	   	        setUserData($scope);

	    	   	        $scope.cancelEditUserInfo();
	    	   	    } else
	    	   	        toggleIonicLoading($ionicLoading, "Could not save user info", true, true, "assertive");
	    	   	}, function error(e) {
	    	   	    if (e.status == 500 || e.status == 404) {
	    	   	        toggleIonicLoading($ionicLoading, null, false);
	    	   	    }
	    	   	});
	       }
	       $scope.loadImages = function (images) {
	           setImageData(images);

	           $state.go('gallery', { userID: $scope.currentProfile.profileID, type: 'User' });
	       };
	       $scope.loadBarberShop = function (barberShop) {
	           $state.go('barbershop', { barberShopID: barberShop.barberShopID });
	       };

	       getUserData($scope);
	       
	       $scope.getUser();

	       $scope.handleNotificationsClick = function () {
	           //getUserNotifications($scope, $ionicPopup);
	           $state.go('notifications');
	       }
	       $scope.handleNotificationClicked = function (notification) {
	           if (notification.title == "New Barber Shop Image") {
	               $state.go('gallery', { userID: notification.barberShopID, type: 'BarberShop' });
	           } else
	               if (notification.title == "New Customer") {
	                   $state.go('userprofile', { profileID: notification.profileID });
	               }
	       }
	       $rootScope.$on("HasNotifications", function () {
	           $scope.hasNotifications = true;
	       });
	   }])
	   .controller('userProfileController', ['$scope', 'MbsAPI', '$stateParams', '$location', '$ionicLoading', '$state', '$rootScope', '$ionicSideMenuDelegate', '$ionicScrollDelegate', function ($scope, MbsAPI, $stateParams, $location, $ionicLoading, $state, $rootScope, $ionicSideMenuDelegate, $ionicScrollDelegate) {
	       
	       var searchObject = $location.search();
	       var profileID = $stateParams.profileID, userInfo = {};
	       $scope.hasNotifications = false;

	       $scope.userImage;
	       $scope.isAvailable;
	       $scope.isAppointments;
	       $scope.isAppointment;
	       $scope.isVacationing;
	       $scope.vacationPeriod;
	       $scope.memberSince;
	       $scope.$ionicScrollDelegate = $ionicScrollDelegate;
	       $scope.screenHeight = ((screen.height - (hasAds ? 50 : 0)) - 260 - parseInt($("#bBar").css("height"))) + "px";

	       $scope.toggleRight = function () {
	           $ionicSideMenuDelegate.toggleRight();
	       };

	       $scope.getUser = function () {

	           //showLoadingBar("Loading Profile...");
	           toggleIonicLoading($ionicLoading, "Loading profile...", true, false, "assertive");

	           $scope.profileInfo = MbsAPI.getUserProfile({
	               call: "profile/gather/details", profileID: profileID
	           },
                   function (data) {
                       if (data && data.response.success) {
                           buildProfile(data, $scope);
                           buildBarberShop(data.barberShop, $scope, null, null, true);

                           var dateCreated = splitDate($scope.currentProfile.dateCreated);

                           $scope.userImage = "url(" + getProfileImage($scope.currentProfile.image, "profile", "background") + ")";
                           $scope.memberSince = getReadableMonth(dateCreated.getMonth()) + " " + dateCreated.getDate() + ", " +
        	               						 dateCreated.getFullYear();
                           /*var gallery = renderGallery($scope.currentProfile.images, "#userGallery");
                           
                           if(gallery != null)
                        	   $("#userGallery").append(gallery);*/

                           handleImages($scope.currentProfile.images);

                           /*$("#userShops").append(renderUserShops($scope));*/
                           
                           $scope.playEffect();
                       } else {
                           //error getting user data
                       }

                       //showNavigation("search");

                       //removeLoadingBar();
                       toggleIonicLoading($ionicLoading, null, false);
                   }, function error(e) {
                       if (e.status == 500 || e.status == 404) {
                           toggleIonicLoading($ionicLoading, null, false);
                       }
                   });
	       };
	       $scope.loadImages = function (images) {
	           setImageData(images);

	           $state.go('gallery', { userID: $scope.currentProfile.profileID, type: 'User' });
	       };
	       $scope.loadBarberShop = function (barberShop) {
	           $state.go('barbershop', { barberShopID: barberShop.barberShopID });
	       };

	       getUserData($scope);

	       $scope.getUser();

	       $scope.handleNotificationsClick = function () {
	           //getUserNotifications($scope, $ionicPopup);
	           $state.go('notifications');
	       }
	       $scope.handleNotificationClicked = function (notification) {
	           if (notification.title == "New Barber Shop Image") {
	               $state.go('gallery', { userID: notification.barberShopID, type: 'BarberShop' });
	           } else
	               if (notification.title == "New Customer") {
	                   $state.go('userprofile', { profileID: notification.profileID });
	               }
	       }
	       $rootScope.$on("HasNotifications", function () {
	           $scope.hasNotifications = true;
	       });
	       $scope.playEffect = function()
	       {
	            setTimeout(function () {
                    ionic.material.motion.slideUp({
                        selector: ".slide-up"
                    });
                }, 500);
                setTimeout(function () {
                    ionic.material.motion.blinds();
                }, 700);

	       }
	   }])
	   .controller('barberSetupController', ['$rootScope', '$scope', 'MbsAPI', '$stateParams', '$location', '$state', '$ionicLoading', '$ionicPopup', '$cordovaDialogs', '$ionicScrollDelegate', function ($rootScope, $scope, MbsAPI, $stateParams, $location, $state, $ionicLoading, $ionicPopup, $cordovaDialogs, $ionicScrollDelegate) {
	       
		   var searchObject = $location.search();	       
	       var scheduling = {};
	       var barberSpecialties = {}; 
	       var barberInfo = {};
	       var barberID;// = $stateParams.barberID;
		   
		   $scope.apptTimes = {};
	       $scope.isAvailable; 
	       $scope.isAppointments;
	       $scope.isAppointment;
	       $scope.isVacationing;
	       $scope.vacationPeriod;
	       $scope.memberSince;
	       $scope.screenHeight = (screen.height - (hasAds ? 50 : 0)) + "px";
	       var savingBarberSchedule = false;

	       $scope.getUser = function () {
	           $scope.userInfo = MbsAPI.getUserProfile({
	               call: "login/gather", values: $scope.mbsProfileID,
	               accountType: getAccountType($scope.mbsAccountType)
	           },
                   function (data) {
                       if (data && data.response.success) {
                    	   	barberID = data.barber.barberID;
                       } else {
                           //error getting user data
                       }

                       //showNavigation("search");
                       $scope.getBarberDetails();

                       toggleIonicLoading($ionicLoading, null);
                   }, function error(e) {
                       if (e.status == 500 || e.status == 404 || barberID == null || barberID == undefined) {
                           $scope.getUser();
                       }
                   });
	       }
	       $scope.getBarberDetails = function () {
	           $scope.shopInfo = MbsAPI.getBarberShopDetails({
	               call: "barber/gather/details", barberID: barberID
	           },
                   function (data) {
                       if (data && data.response.success) {
                           if (data.member) {
                               buildBarberProfile(data.member, $scope);

                               if(savingBarberSchedule)
                               {
                                   savingBarberSchedule = false;

                                   $scope.scheduleInfo = MbsAPI.createBarberSchedule({
                                       call: "barber/schedule/create", values: barberID,
                                       sunday: checkTime(scheduling.sunday), monday: checkTime(scheduling.monday), tuesday: checkTime(scheduling.tuesday),
                                       wednesday: checkTime(scheduling.wednesday), thursday: checkTime(scheduling.thursday), friday: checkTime(scheduling.friday),
                                       saturday: checkTime(scheduling.saturday), blackOutTime: checkTime(scheduling.freetime), profileID: $scope.mbsProfileID
                                   },
                                   function (data) {
                                       if (data && data.response.success) {
                                           if (data.member) {
                                               $scope.currentBarber.barberSchedule = data.member;

                                               //updateStatusMessage("Schedule saved successfully", "success");
                                               toggleIonicLoading($ionicLoading, "Schedule saved successfully", true, false, "balanced");

                                               $("#barberScheduleDiv").css("display", "none");
                                               $("#barberSpecialtiesDivContainer").css("display", "block");

                                               //showLoadingBar("Loading specialties...");
                                               toggleIonicLoading($ionicLoading, "Loading specialties...", true, false, "assertive");

                                               $scope.getSpecialties();
                                           }
                                       } else {
                                           //updateStatusMessage("Could not save schedule", "error");
                                           toggleIonicLoading($ionicLoading, "Could not save schedule", true, true, "assertive");
                                       }
                                   }, function error(e) {
                                       if (e.status == 500 || e.status == 404) {
                                           toggleIonicLoading($ionicLoading, null, false);
                                       }
                                   });
                               }
                           }
                       }
                   }, function error(e) {
                       if (e.status == 500 || e.status == 404) {
                           toggleIonicLoading($ionicLoading, null, false);
                       }
                   });
	       }
	       $scope.saveBarberSchedule = function()
	       {
	           //postStatusMessage("Saving schedule", "info");
	           toggleIonicLoading($ionicLoading, "Saving schedule", true, false, "assertive");
	    	   
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
	    	       //alert(err);
	    	       //showIonicAlert($ionicPopup, null, "Schedule Error", err, "assertive", "button-assertive");
	    	       showCordovaAlert($cordovaDialogs, "Schedule Error", err, "OK");
	    	       toggleIonicLoading($ionicLoading, null);

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
	    		       //updateStatusMessage(err + "\n" + tooLarge, "error");
	    		       //showIonicAlert($ionicPopup, null, "Schedule Error", err + "\n" + tooLarge, "assertive", "button-assertive");
	    		       showCordovaAlert($cordovaDialogs, "Schedule Error", err + "\n" + tooLarge, "OK");
	    		   else
	    			   if(hasBlankTime)
	    			       //updateStatusMessage(err, "error");
	    			       //showIonicAlert($ionicPopup, null, "Schedule Error", err, "assertive", "button-assertive");
	    			       showCordovaAlert($cordovaDialogs, "Schedule Error", err, "OK");
	    			   else
	    				   if(isTooLarge)
	    				       //updateStatusMessage(tooLarge, "error");
	    				       //showIonicAlert($ionicPopup, null, "Schedule Error", tooLarge, "assertive", "button-assertive");
	    				       showCordovaAlert($cordovaDialogs, "Schedule Error", tooLarge, "OK");

	    		   toggleIonicLoading($ionicLoading, null);

	    		   hasError = false;
    		   }else
			   {
	    	       if ($scope.currentBarber == null || $scope.currentBarber == undefined) {
	    	           $scope.getBarberDetails();
	    	           savingBarberSchedule = true;
	    	       }
	    	       else {
	    	           savingBarberSchedule = false;

	    	           $scope.scheduleInfo = MbsAPI.createBarberSchedule({
	    	               call: "barber/schedule/create", values: barberID,
	    	               sunday: checkTime(scheduling.sunday), monday: checkTime(scheduling.monday), tuesday: checkTime(scheduling.tuesday),
	    	               wednesday: checkTime(scheduling.wednesday), thursday: checkTime(scheduling.thursday), friday: checkTime(scheduling.friday),
	    	               saturday: checkTime(scheduling.saturday), blackOutTime: checkTime(scheduling.freetime), profileID: $scope.mbsProfileID
	    	           },
                           function (data) {
                               if (data && data.response.success) {
                                   if (data.member) {
                                       $scope.currentBarber.barberSchedule = data.member;

                                       //updateStatusMessage("Schedule saved successfully", "success");
                                       toggleIonicLoading($ionicLoading, "Schedule saved successfully", true, false, "balanced");

                                       $("#barberScheduleDiv").css("display", "none");
                                       $("#barberSpecialtiesDivContainer").css("display", "block");

                                       //showLoadingBar("Loading specialties...");
                                       toggleIonicLoading($ionicLoading, "Loading specialties...", true, false, "assertive");

                                       $scope.getSpecialties();
                                   }
                               } else {
                                   //updateStatusMessage("Could not save schedule", "error");
                                   toggleIonicLoading($ionicLoading, "Could not save schedule", true, true, "assertive");
                               }
                           }, function error(e) {
                               if (e.status == 500 || e.status == 404) {
                                   toggleIonicLoading($ionicLoading, null, false);
                               }
                           });
	    	       }
			   }
	       }
	       $scope.saveBarberSpecialties = function()
	       {
	          // postStatusMessage("Saving specialties", "info")
	           toggleIonicLoading($ionicLoading, "Saving specialties", true, false, "assertive");

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
		               call: "specialties/create/barber", values: barberID,
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
	                           
	                           //updateStatusMessage("Specialties saved successfully", "success");
	                           toggleIonicLoading($ionicLoading, "Specialties saved successfully", true, true, "balanced");
	                           
	                           setBarberData(barberInfo);
	                           
	                           //getPageView("barbersetup.html", "search.html", null); 
	                           $state.go('shopsearch', { type: "BarberSetup" });
	                       }
	                   }else
	            	   {
	                       //updateStatusMessage("Could not save specialties", "error");
	                       toggleIonicLoading($ionicLoading, "Could not save specialties", true, true, "assertive");
	            	   }
	               }, function error(e) {
	                   if (e.status == 500 || e.status == 404) {
	                       toggleIonicLoading($ionicLoading, null, false);
	                   }
	               });
    		   }else
			   {
	    	       //updateStatusMessage("Please select at least one specialty", "error");
	    	       //showIonicAlert($ionicPopup, null, "Specialties Error", "Please select at least one specialty", "assertive", "button-assertive");
	    	       showCordovaAlert($cordovaDialogs, "Specialties Error", "Please select at least one specialty", "OK");
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
	    					   
	    					   $("#barberSpecialtiesDiv").append(
                                    $("<li/>").addClass("item item-checkbox item-checkbox-right mbsfont").append(
                                        specialty.specialty,
			   						    $("<label/>").addClass("checkbox checkbox-assertive")
			   									     .append(
                                            $("<input>").prop("type", "checkbox")
    							   				        .prop("name", specialty.specialty)
    							   				        .prop("value", specialty.specialtyID)
    							   				        .addClass("specialties")
    							   				        .click(function(){    							   					
    							   					        if($(this).is(":checked")) {
    							   						        barberSpecialties[$(this).prop("name")] = $(this).val();
      							   			                }else
      							   			        	        barberSpecialties[$(this).prop("name")] = null;
			    							   	        })
                                        )
                                    )
	    					   )
	    				   });

	    				   $ionicScrollDelegate.scrollTop(true);
    				   }
	    		   }

	    		   toggleIonicLoading($ionicLoading, null);
	    		   
	    		   //removeLoadingBar();
	    	   	}, function error(e) {
	    	   	    if (e.status == 500 || e.status == 404) {
	    	   	        $scope.getSpecialties();
	    	   	    }
	    	   	});
	       }
	       $scope.saveBarberInfo = function(){
	    	   
	           //postStatusMessage("Saving barber info", "info");
	           toggleIonicLoading($ionicLoading, "Saving barber info", true, false, "assertive");
	    	   
	    	   barberInfo.acceptsAppointments = $("#acceptAppt").is(":checked");
	    	   barberInfo.barberID = barberID;
	    	   
	    	   //updateStatusMessage("Barber info saved successfully", "success");
	    	   toggleIonicLoading($ionicLoading, "Barber info saved successfully", true, true, "balanced");
	    	   
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
	    				  $("<option/>").append(
	    						  $("<a/>").text(time)
						  )
				  ) 
	    	   });
			  
	    	   $scope.apptTimes["00:00 AM"] = "OFF";
	    	   
	    	   angular.forEach($scope.apptTimes, function(time, key){
	    		  $(".barberhours").append(
	    				  $("<option/>").append(
	    						  $("<a/>").text(time)
						  )
				  ) 
	    	   });
    	   }
	       
	       /*angular.forEach($scope.yearsOfExperience, function(exp, key){
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
	    	   });*/
	       
	       $scope.getUser();
	       
	       //$rootScope.toggle("barberScheduleOverlay", "on");
	       
	       $(".barberhours").change(function()
		   {    		
	    	  var time; 
	    	  var pDiv;
	    	  
	    	  if($(this).attr("data-type").trim() == "Time In")
    		  {
	    		 if($(this).val().trim() == "OFF") 
	    		 {
	    			 pDiv =  $(this).parent().next(); 
	    		 
	    			 $(pDiv[0]).children("select").val("OFF");
	    		 }else
					  if($(this).parent().next().children("select").val() == "OFF")
					  {
						  $(this).parent().next().children("select").val("8:00 AM")
					  }
		    	  
				 if(scheduling[$(this).attr("value").toLowerCase()])
				 {
					 time = scheduling[$(this).attr("value").toLowerCase()].split("-");
					 
					 scheduling[$(this).attr("value").toLowerCase()] = $(this).val() == 'OFF' ? ("OFF - OFF") : (($(this).val() + " - ") + (time[1].trim() == "OFF" ? "Time Out" : time[1].trim()));
				 }
				 else
					 scheduling[$(this).attr("value").toLowerCase()] = $(this).val() == 'OFF' ? ("OFF - OFF") : ($(this).val() + " - ");
    		  }else
	    	      if ($(this).attr("data-type").trim() == "Time Out")
        		  {
    				  if($(this).val().trim() == "OFF")
    				  {
    					  pDiv =  $(this).parent().prev(); 
    					  
    					  $(pDiv[0]).children("select").val("OFF");
    				  }else
    					  if($(this).parent().prev().children("select").val() == "OFF")
						  {
    						  (this).parent().prev().children("select").val("8:00 AM")
						  }
    		    	  
    	    		 if(scheduling[$(this).attr("value").toLowerCase()])
    				 {
    					 time = scheduling[$(this).attr("value").toLowerCase()].split("-");
    					 
    					 scheduling[$(this).attr("value").toLowerCase()] = $(this).val() == 'OFF' ? ("OFF - OFF") : ((time[0].trim() == "OFF" ? "Time In" : time[0].trim()) + " - " + $(this).val());
    				 }
    				 else
    					 scheduling[$(this).attr("value").toLowerCase()] = $(this).val() == 'OFF' ? ("OFF - OFF") : (" - " + $(this).val());
        		  }
	    	  
			  //$(this).val($(this).val());
	       });
	       //$(".specialties").change(function(){
	       //    alert($(this).val());
	       //});
	       $(".normalTimeIn").change(function()
	       {
	    	   barberInfo.normalTimeIn = $(this).children(":selected").val().trim();
	    	  
			   //$(this).parent().parent().prev().text($(this).text());
	       });
	       $(".yearsOfExperience").change(function()
		   {    		
	           barberInfo.yearsOfExperience = $(this).children(":selected").val().trim();
	    	  
			   //$(this).parent().parent().prev().text($(this).text());
	       });
	       $(".avgCutTime").change(function ()
		   {    		
	           barberInfo.avgCutTime = $(this).children(":selected").val().trim();
	    	  
			   //$(this).parent().parent().prev().text($(this).text());
	       });
	       
	       //set default values 
	       barberInfo.normalTimeIn = "8:00 AM";
	       barberInfo.yearsOfExperience = "1";
	       barberInfo.avgCutTime = "5";
    	   scheduling["sunday"] = "8:00 AM" + " - " + "8:00 AM";
    	   scheduling["monday"] = "8:00 AM" + " - " + "8:00 AM";
    	   scheduling["tuesday"] = "8:00 AM" + " - " + "8:00 AM";
    	   scheduling["wednesday"] = "8:00 AM" + " - " + "8:00 AM";
    	   scheduling["thursday"] = "8:00 AM" + " - " + "8:00 AM";
    	   scheduling["friday"] = "8:00 AM" + " - " + "8:00 AM";
    	   scheduling["saturday"] = "8:00 AM" + " - " + "8:00 AM";
    	   scheduling["freetime"] = "8:00 AM" + " - " + "8:00 AM";
	   }])
	   .controller('barberProfileController', ['$rootScope', '$scope', 'MbsAPI', '$stateParams', '$location', '$ionicLoading', '$ionicPopup', '$state', '$ionicSideMenuDelegate', '$cordovaDatePicker', '$cordovaDialogs', '$ionicScrollDelegate', function ($rootScope, $scope, MbsAPI, $stateParams, $location, $ionicLoading, $ionicPopup, $state, $ionicSideMenuDelegate, $cordovaDatePicker, $cordovaDialogs, $ionicScrollDelegate) {
	       
	       var searchObject = $location.search();	       
	       var scheduling = {};
	       var barberSpecialties = {}; 
	       var barberInfo = {}, barberStatus = {};
	       var barberID = $stateParams.barberID;
	       $scope.hasNotifications = false;
		   
		   $scope.apptTimes = {};
	       $scope.isAvailable; 
	       $scope.isAppointments;
	       $scope.isAppointment;
	       $scope.isVacationing;
	       $scope.vacationPeriod;
	       $scope.memberSince;
	       $scope.barberImage;
	       $scope.isInfo = true;
	       $scope.isStatus = false;
	       $scope.isSpecialties = false;
	       $scope.isSchedule = false;
	       $scope.$ionicScrollDelegate = $ionicScrollDelegate;
	       $scope.screenHeight = ((screen.height - (hasAds ? 50 : 0)) - 240 - parseInt($("#bBar").css("height"))) + "px";
		   
	       $scope.toggleRight = function () {
	           $ionicSideMenuDelegate.toggleRight();
	       };

	       $scope.getUser = function () {
	    	   
	    	   //showLoadingBar("Loading barber profile...");
	    	   toggleIonicLoading($ionicLoading, "Loading barber profile", true, false, "assertive");
	    	   
	           $scope.userInfo = MbsAPI.getUserProfile({
	               call: "login/gather", values: $scope.mbsProfileID,
	               accountType: getAccountType($scope.mbsAccountType)
	           },
                   function (data) {
                       if (data && data.response.success) {
                    	   
                    	   if(!barberID)
                		   {
	                    	   	//$location.search("barberID", data.barber.barberID);
	                    	   	//searchObject = $location.search();
                    		   barberID = data.barber.barberID;
                		   }
                       } else {
                           //error getting user data
                       }

                       //showNavigation("search");
                       $scope.getBarberDetails();
                   }, function error(e) {
                       if (e.status == 500 || e.status == 404) {
                           toggleIonicLoading($ionicLoading, null, false);
                       }
                   });
	       }
	       $scope.getBarberDetails = function () {
	           $scope.shopInfo = MbsAPI.getBarberShopDetails({
	               call: "barber/gather/details", barberID: barberID
	           },
                   function (data) {
                       if (data && data.response.success) {
                           if (data.member) {
                               buildBarberProfile(data.member, $scope);                               

                               $scope.barberImage = getProfileImage($scope.currentBarber.profile.image, "barber", "avatar");
                               $scope.currentBarber.acceptsAppointmentsFlag = convertBoolean($scope.currentBarber.acceptsAppointments);
                               $scope.currentBarber.isFreelancerFlag = convertBoolean($scope.currentBarber.isFreelancer);
                               $scope.currentBarber.ratingCalc = calculateRating(data.member.rating, 100);

                               $scope.isVacationing = convertBoolean($scope.currentBarber.barberStatus.isOnVacation);
                               $scope.vacationColor = $scope.isVacationing == 'No' ? "#ef473a" : "green";
                               $scope.isEating = convertBoolean($scope.currentBarber.barberStatus.isAtLunch);
                               $scope.eatingColor = $scope.isEating == 'No' ? "#ef473a" : "green";
                               $scope.isAvailable = convertBoolean($scope.currentBarber.barberStatus.isAvailable);
                               $scope.availableColor = $scope.isAvailable == 'No' ? "#ef473a" : "green";
                               //$scope.isAppointments = convertBoolean($scope.currentBarber.acceptsAppointments);
                               //$scope.isAppointment = $scope.currentBarber.acceptsAppointments == "false" || $scope.currentBarber.profile.profileID == $scope.mbsProfileID ? true : false;

                               if ($scope.currentBarber.bacgroundImage && $scope.currentBarber.backgroundImage.imageID) {
                                   //$scope.currentBarber.barberShop.image.defaultImage = $scope.currentBarber.barberShop.image.fileLocation + $scope.currentBarber.barberShop.image.fileName;

                                   $scope.shopImage = "url(" + getProfileImage($scope.currentBarber.backgroundImage, "barber", "background") + ")";
                               }
                               else {

                                   $scope.shopImage = "url(" + getProfileImage($scope.currentBarber.backgroundImage, "barber", "background") + ")";
                               }

                               setTimeout(function () {
                                   ionic.material.motion.slideUp({
                                       selector: ".slide-up"
                                   });
                               }, 500);
                           }
                       }
                       
                       //removeLoadingBar();
        	           
        	           toggleIonicLoading($ionicLoading, null);
                   }, function error(e) {
                       if (e.status == 500 || e.status == 404) {
                           toggleIonicLoading($ionicLoading, null, false);
                       }
                   });
	       }
	       $scope.editBarberInfo = function(){
	    	   if($scope.currentBarber)
    		   {
	    		   $("#barberInfoStatic").css("display", "none");
	    		   $("#barberInfoEdit").css("display", "block");
	    		   
	    		   $("#newDisplayName").val($scope.currentBarber.profile.displayName);
	    		   barberInfo.displayName = $scope.currentBarber.profile.displayName;
	    		   barberInfo.normalTimeIn = $scope.currentBarber.normalTimeIn == null || $scope.currentBarber.normalTimeIn == undefined ? "8:00 AM" : $scope.currentBarber.normalTimeIn;
		    	   $(".normalTimeIn").val(barberInfo.normalTimeIn);
		    	   barberInfo.yearsOfExperience = $scope.currentBarber.yearsOfExperience == 0 || $scope.currentBarber.yearsOfExperience == undefined ? 1 : $scope.currentBarber.yearsOfExperience;
		    	   $(".yearsOfExperience option").filter(function() {
		    		    //may want to use $.trim in here
		    		    return $(this).text().trim() == barberInfo.yearsOfExperience; 
		    		}).prop('selected', true);
		    	   //$(".yearsOfExperience").val($scope.currentBarber.yearsOfExperience);
		    	   barberInfo.avgCutTime = $scope.currentBarber.avgCutTime == null || $scope.currentBarber.avgCutTime == undefined ? 25 : $scope.currentBarber.avgCutTime;
		    	   $(".avgCutTime option").filter(function() {
		    		    //may want to use $.trim in here
		    		    return $(this).text().trim() == barberInfo.avgCutTime; 
		    		}).prop('selected', true);
		    	   //$(".avgCutTime").val($scope.currentBarber.avgCutTime);
		    	   $("#acceptAppt").attr("checked", $scope.currentBarber.acceptsAppointments == "true" ? true : false);
		    	   barberInfo.acceptsAppointments = $scope.currentBarber.acceptsAppointments;
		    	   $("#freelancer").attr("checked", $scope.currentBarber.isFreelancer == "true" ? true : false);
		    	   barberInfo.isFreelancer = $scope.currentBarber.isFreelancer;
    		   }
	       }
	       $scope.cancelEditBarberInfo = function(){
	    	   $("#barberInfoStatic").css("display", "block");
	    	   $("#barberInfoEdit").css("display", "none");

	    	   $ionicScrollDelegate.scrollTop(true);
	       }
	       $scope.updateBarberInfo = function(){	    	  
	    	   //postStatusMessage("Saving barber info", "info");
	    	   toggleIonicLoading($ionicLoading, "Saving barber info", true, false, "assertive");
	    	   
	    	   $scope.updateBarberInfo = MbsAPI.updateBarberInfo({
	    		   call: "barber/save/barberinfo", values: barberID,
	    		   normalTimeIn: barberInfo.normalTimeIn, yearsOfExperience: barberInfo.yearsOfExperience,
	    		   avgCutTime: barberInfo.avgCutTime, acceptsAppointments: $("#acceptAppt").is(":checked"),
	    		   profileID: $scope.mbsProfileID, barberShopID: $scope.currentBarber.barberShopID, owner: $scope.currentBarber.isOwner,
	    		   dateCreated: createJavaDate($scope.mbsDateCreated), displayName: $("#newDisplayName").val() != null ? $("#newDisplayName").val() : barberInfo.displayName,
	    		   isfreelancer: $("#freelancer").is(":checked")
	    	   }, 
	    	   	function(data){
	    		   if(data && data.response.success)
    			   {	    			   
	    			   //updateStatusMessage("Barber info saved successfully", "success");
	    			   toggleIonicLoading($ionicLoading, "Barber info saved successfully", true, true, "balanced");
	    			   
	    			   $scope.currentBarber.profile.displayName = $("#newDisplayName").val();
	    			   $scope.currentBarber.normalTimeIn = barberInfo.normalTimeIn;
	    			   $scope.currentBarber.yearsOfExperience = barberInfo.yearsOfExperience;
	    			   $scope.currentBarber.avgCutTime = barberInfo.avgCutTime;
	    			   $scope.currentBarber.acceptsAppointments = $("#acceptAppt").is(":checked").toString();
	    			   $scope.currentBarber.isFreelancer = $("#freelancer").is(":checked").toString();
	    			   $scope.currentBarber.acceptsAppointmentsFlag = convertBoolean($scope.currentBarber.acceptsAppointments);
	    			   $scope.currentBarber.isFreelancerFlag = convertBoolean($scope.currentBarber.isFreelancer);
                       
                       $scope.cancelEditBarberInfo();
    			   }else	    		   
    				   //updateStatusMessage("Could not save barber info", "error");
    				   toggleIonicLoading($ionicLoading, "Could not save barber info", true, true, "assertive");
	    	   	}, function error(e) {
	    	   	    if (e.status == 500 || e.status == 404) {
	    	   	        toggleIonicLoading($ionicLoading, null, false);
	    	   	    }
	    	   	});
	       }
	       $scope.editBarberStatus = function () {
	           if ($scope.currentBarber) {
	               $("#barberStatusStatic").css("display", "none");
	               $("#barberStatusEdit").css("display", "block");

	               $(".timeIn").val($scope.currentBarber.barberStatus.timeIn);
	               barberStatus.timeIn = $scope.currentBarber.barberStatus.timeIn;
	               $(".timeOut").val($scope.currentBarber.barberStatus.timeOut);
	               barberStatus.timeOut = $scope.currentBarber.barberStatus.timeOut;
	               $(".currentClients option").filter(function () {
	                   //may want to use $.trim in here
	                   return $(this).text().trim() == $scope.currentBarber.barberStatus.currentClients;
	               }).prop('selected', true);
                   barberStatus.currentClients = $scope.currentBarber.barberStatus.currentClients;
	               $("#available").attr("checked", $scope.currentBarber.barberStatus.isAvailable == "true" ? true : false);
	               barberStatus.isAVailable = $scope.currentBarber.barberStatus.isAvailable;
	               $("#atLunch").attr("checked", $scope.currentBarber.barberStatus.isAtLunch == "true" ? true : false);
	               barberStatus.isAtLunch = $scope.currentBarber.barberStatus.isAtLunch;
	               $("#onVacation").attr("checked", $scope.currentBarber.barberStatus.isOnVacation == "true" ? true : false);
	               barberStatus.isOnVacation = $scope.currentBarber.barberStatus.isOnVacation;
	               $("#vacationStartDateField").val(moment(splitDate($scope.currentBarber.barberStatus.vacationStartDate), "MMM DD, YYYY"));
	               barberStatus.vacationStartDate = $scope.currentBarber.barberStatus.vacationStartDate;
	               $("#vacationEndDateField").val($scope.currentBarber.barberStatus.vacationEndDateReadable);
	               barberStatus.vacationEndDate = $scope.currentBarber.barberStatus.vacationEndDate;
	           }
	       }
	       $scope.cancelEditBarberStatus = function () {
	           $("#barberStatusStatic").css("display", "block");
	           $("#barberStatusEdit").css("display", "none");

	           $ionicScrollDelegate.scrollTop(true);
	       }
	       $scope.updateBarberStatus = function () {
	           var invalid = false, invalidVacation = false, vacationMessage;

	           toggleIonicLoading($ionicLoading, "Updating barber status...", true, false, "assertive");

	           if((barberStatus.timeOut && barberStatus.timeIn) && (decodeTime(barberStatus.timeOut) <= decodeTime(barberStatus.timeIn))) 
	               invalid = true;
	           
	           var startDate = $("#vacationStartDateField").val().toString(), endDate = $("#vacationEndDateField").val().toString();

	           if ((startDate && !endDate) || (!startDate && endDate))
	           {
	               invalidVacation = true;

	               vacationMessage = "Vacation dates must both be entered or neither";
	           }
	           else
	               if (startDate && endDate)
	               {
	                   if(!moment(startDate).isBefore(endDate))
	                   {
	                       invalidVacation = true;

	                       vacationMessage = "Vacation start date must be before end date";
	                   }else
	                   {
	                       var currentDate = new Date();

	                       if (moment(startDate).isBefore(new Date(currentDate.getYear(), currentDate.getMonth(), currentDate.getDate())) || moment(endDate).isBefore(new Date(currentDate.getYear(), currentDate.getMonth(), currentDate.getDate())))
                           {
	                           invalidVacation = true;

	                           vacationMessage = "Vacation dates must start with todays date or later";
	                       }
	                  }
	               }

	           if(!invalidVacation)
	           {
	               startDate = startDate == null || startDate == undefined || startDate == "" ? barberStatus.vacationStartDate : splitDate(startDate);
	               endDate = endDate == null || endDate == undefined || endDate == "" ? barberStatus.vacationEndDate : splitDate(endDate);

	               if(ionic.Platform.isAndroid())
	               {
	                   startDate = moment(startDate);
	                   startDate.add(1, "days");
	                   endDate = moment(endDate);
	                   endDate.add(1, "days");
	               }
	           }

	           if (invalid || invalidVacation) {
	               if (invalid)
	                   //showIonicAlert($ionicPopup, null, "Time Error", "Time Out must be greater than Time In", "assertive", "button-assertive");
	                   showCordovaAlert($cordovaDialogs, "Time Error", "Time Out must be greater than Time In", "OK");
	               else
	                   if (invalidVacation)
	                       //showIonicAlert($ionicPopup, null, "Vacation Error", vacationMessage, "assertive", "button-assertive");
	                       showCordovaAlert($cordovaDialogs, "Vacation Error", vacationMessage, "OK");

	                toggleIonicLoading($ionicLoading, null);
	            } else {
	                MbsAPI.updateBarberStatus({
	                    call: "barberstatus/update", values: $scope.mbsProfileID,
	                    barberID: $scope.currentBarber.barberID, currentClients: barberStatus.currentClients,
	                    isAvailable: $("#available").is(":checked"), isAtLunch: $("#atLunch").is(":checked"),
	                    isOnVacation: $("#onVacation").is(":checked"), timeIn: barberStatus.timeIn != undefined ? barberStatus.timeIn : null,
	                    timeOut: barberStatus.timeOut != undefined ? barberStatus.timeOut : null, vacationStartDate: startDate != "" ? createJavaDate(startDate) : null,
	                    vacationEndDate: endDate != "" ? createJavaDate(endDate) : null, barberStatusID: $scope.currentBarber.barberStatus.barberStatusID
	                },
                        function (data) {
                            if (data && data.response.success) {
                                if (data.member) {

                                    $scope.currentBarber.barberStatus.currentClients = barberStatus.currentClients;
                                    $scope.currentBarber.barberStatus.isAvailable = $("#available").is(":checked");
                                    $scope.availableColor = $("#available").is(":checked") ? "green" : "red";
                                    $scope.currentBarber.barberStatus.isAtLunch = $("#atLunch").is(":checked");
                                    $scope.eatingColor = $("#atLunch").is(":checked") ? "green" : "red";
                                    $scope.currentBarber.barberStatus.isOnVacation = $("#onVacation").is(":checked");
                                    $scope.vacationColor = $("#onVacation").is(":checked") ? "green" : "#ef473a";
                                    $scope.currentBarber.barberStatus.timeIn = barberStatus.timeIn != undefined ? barberStatus.timeIn : "";
                                    $scope.currentBarber.barberStatus.timeOut = barberStatus.timeOut != undefined ? barberStatus.timeOut : "";
                                    if (ionic.Platform.isAndroid()) {
                                        startDate = moment(startDate);
                                        startDate.subtract(1, "days");
                                        endDate = moment(endDate);
                                        endDate.subtract(1, "days");

                                        $scope.currentBarber.barberStatus.vacationStartDate = startDate;
                                        $scope.currentBarber.barberStatus.vacationEndDate = endDate;
                                    } else
                                    {
                                        $scope.currentBarber.barberStatus.vacationStartDate = startDate;
                                        $scope.currentBarber.barberStatus.vacationEndDate = endDate;
                                    }
                                    $scope.currentBarber.barberStatus.vacationStartDateReadable = startDate != null || startDate != undefined ? formatDateNoTime(startDate) : "N/A";
                                    $scope.currentBarber.barberStatus.vacationEndDateReadable = endDate != null || endDate != undefined ? formatDateNoTime(endDate) : "N/A";

                                    $scope.isVacationing = convertBoolean($scope.currentBarber.barberStatus.isOnVacation);
                                    $scope.isEating = convertBoolean($scope.currentBarber.barberStatus.isAtLunch);
                                    $scope.isAvailable = convertBoolean($scope.currentBarber.barberStatus.isAvailable);
                                    $scope.cancelEditBarberStatus();

                                    toggleIonicLoading($ionicLoading, "Barber status updated successfully!", true, true, "balanced");
                                }
                            }
                        }, function error(e) {
                            if (e.status == 500 || e.status == 404) {
                                toggleIonicLoading($ionicLoading, null, false);
                            }
                        });
	            }
	        }
	       $scope.editBarberSchedule = function(){
	    	   if($scope.currentBarber)
    		   {
	    		   $("#barberScheduleStatic").css("display", "none");
	    		   $("#barberScheduleEdit").css("display", "block");
	    		   
	    		   var hours = [];
	    		   
	    		   hours = $scope.currentBarber.barberSchedule.sunday.split("-");
	    		   
		    	   $(".sundayIn").val(hours[0].trim() == "OFF" ? "OFF" : hours[0].trim());
		    	   $(".sundayOut").val(hours[0].trim() == "OFF" ? "OFF" : hours[1].trim());
		    	   scheduling["sunday"] = hours[0].trim() == "OFF" ? "OFF - OFF" : hours[0].trim() + " - " + hours[1].trim();
	    		   hours = $scope.currentBarber.barberSchedule.monday.split("-");
		    	   $(".mondayIn").val(hours[0].trim() == "OFF" ? "OFF" : hours[0].trim());
		    	   $(".mondayOut").val(hours[0].trim() == "OFF" ? "OFF" : hours[1].trim());
		    	   scheduling["monday"] = hours[0].trim() == "OFF" ? "OFF - OFF" : hours[0].trim() + " - " + hours[1].trim();
	    		   hours = $scope.currentBarber.barberSchedule.tuesday.split("-");
		    	   $(".tuesdayIn").val(hours[0].trim() == "OFF" ? "OFF" : hours[0].trim());
		    	   $(".tuesdayOut").val(hours[0].trim() == "OFF" ? "OFF" : hours[1].trim());
		    	   scheduling["tuesday"] = hours[0].trim() == "OFF" ? "OFF - OFF" : hours[0].trim() + " - " + hours[1].trim();
	    		   hours = $scope.currentBarber.barberSchedule.wednesday.split("-");
		    	   $(".wednesdayIn").val(hours[0].trim() == "OFF" ? "OFF" : hours[0].trim());
		    	   $(".wednesdayOut").val(hours[0].trim() == "OFF" ? "OFF" : hours[1].trim());
		    	   scheduling["wednesday"] = hours[0].trim() == "OFF" ? "OFF - OFF" : hours[0].trim() + " - " + hours[1].trim();
	    		   hours = $scope.currentBarber.barberSchedule.thursday.split("-");
		    	   $(".thursdayIn").val(hours[0].trim() == "OFF" ? "OFF" : hours[0].trim());
		    	   $(".thursdayOut").val(hours[0].trim() == "OFF" ? "OFF" : hours[1].trim());
		    	   scheduling["thursday"] = hours[0].trim() == "OFF" ? "OFF - OFF" : hours[0].trim() + " - " + hours[1].trim();
	    		   hours = $scope.currentBarber.barberSchedule.friday.split("-");
		    	   $(".fridayIn").val(hours[0].trim() == "OFF" ? "OFF" : hours[0].trim());
		    	   $(".fridayOut").val(hours[0].trim() == "OFF" ? "OFF" : hours[1].trim());
		    	   scheduling["friday"] = hours[0].trim() == "OFF" ? "OFF - OFF" : hours[0].trim() + " - " + hours[1].trim();
	    		   hours = $scope.currentBarber.barberSchedule.saturday.split("-");
		    	   $(".saturdayIn").val(hours[0].trim() == "OFF" ? "OFF" : hours[0].trim());
		    	   $(".saturdayOut").val(hours[0].trim() == "OFF" ? "OFF" : hours[1].trim());
		    	   scheduling["saturday"] = hours[0].trim() == "OFF" ? "OFF - OFF" : hours[0].trim() + " - " + hours[1].trim();
	    		   hours = $scope.currentBarber.barberSchedule.blackOutTime.split("-");
		    	   $(".freeTimeIn").val(hours[0].trim() == "OFF" ? "OFF" : hours[0].trim());
		    	   $(".freeTimeOut").val(hours[0].trim() == "OFF" ? "OFF" : hours[1].trim());
		    	   scheduling["freetime"] = hours[0].trim() == "OFF" ? "OFF - OFF" : hours[0].trim() + " - " + hours[1].trim();
    		   }
	       }
	       $scope.cancelEditBarberSchedule = function(){
	    	   $("#barberScheduleStatic").css("display", "block");
	    	   $("#barberScheduleEdit").css("display", "none");

	    	   $ionicScrollDelegate.scrollTop(true);
	       }
	       $scope.saveBarberSchedule = function()
	       {
	    	   //postStatusMessage("Saving schedule", "info");
	    	   toggleIonicLoading($ionicLoading, "Saving schedule", true, false, "assertive");
	    	   
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
	    	       //alert(err);
	    	       showCordovaAlert($cordovaDialogs, "Schedule Error", err, "OK");
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
	    		       //updateStatusMessage(err + "\n" + tooLarge, "error");
	    		       //showIonicAlert($ionicPopup, null, "Schedule Error", err + "\n" + tooLarge, "assertive", "button-assertive");
	    		       showCordovaAlert($cordovaDialogs, "Schedule Error", err + "\n" + tooLarge, "OK");
	    		   else
	    			   if(hasBlankTime)
	    			       //updateStatusMessage(err, "error");
	    			       //showIonicAlert($ionicPopup, null, "Schedule Error", err, "assertive", "button-assertive");
	    			       showCordovaAlert($cordovaDialogs, "Schedule Error", err, "OK");
	    			   else
	    				   if(isTooLarge)
	    				       //updateStatusMessage(tooLarge, "error");
	    				       //showIonicAlert($ionicPopup, null, "Schedule Error", tooLarge, "assertive", "button-assertive");
	    				       showCordovaAlert($cordovaDialogs, "Schedule Error", tooLarge, "OK");
	    		   
	    		   toggleIonicLoading($ionicLoading, null);
	    		   
	    		   hasError = false;
    		   }else
			   {
    			   if($scope.currentBarber == null || $scope.currentBarber == undefined)
    				   $scope.getBarberDetails();
    			   
    			   $scope.scheduleInfo = MbsAPI.updateBarberSchedule({
    	               call: "barber/schedule/update", values: barberID,
    	               sunday: checkTime(scheduling.sunday), monday: checkTime(scheduling.monday), tuesday: checkTime(scheduling.tuesday),
    	               wednesday: checkTime(scheduling.wednesday), thursday: checkTime(scheduling.thursday), friday: checkTime(scheduling.friday),
    	               saturday: checkTime(scheduling.saturday), blackOutTime: checkTime(scheduling.freetime), profileID: $scope.mbsProfileID,
    	               barberScheduleID: $scope.currentBarber.barberSchedule.barberScheduleID
    	           },
                       function (data) {
                           if (data && data.response.success) {
                               if (data.member) {
                                  $scope.currentBarber.barberSchedule = data.member;
                                   
                                  //updateStatusMessage("Schedule saved successfully", "success");
                                  toggleIonicLoading($ionicLoading, "Schedule saved successfully", true, true, "balanced");
                                  
                                  $scope.cancelEditBarberSchedule();
                               }
                           }else
                    	   {
                        	   //updateStatusMessage("Could not save schedule", "error");
                        	   toggleIonicLoading($ionicLoading, "Could not save schedule", true, true, "assertive");
                    	   }
                       }, function error(e) {
                           if (e.status == 500 || e.status == 404) {
                               toggleIonicLoading($ionicLoading, null, false);
                           }
                       });
			   }
	       }
	       $scope.editBarberSpecialties = function(){ 
	    	   $("#barberSpecialtiesStatic").css("display", "none");
    		   $("#barberSpecialtiesEdit").css("display", "block");
    		   
    		   //showLoadingBar("Loading specialties...");
    		   toggleIonicLoading($ionicLoading, "Loading specialties...", true, false, "assertive");
    		   
    		   $scope.getSpecialties();
	       }
	       $scope.cancelEditBarberSpecialties = function(){
	    	   $("#barberSpecialtiesStatic").css("display", "block");
	    	   $("#barberSpecialtiesEdit").css("display", "none");

	    	   $ionicScrollDelegate.scrollTop(true);
	       }
	       $scope.saveBarberSpecialties = function()
	       {
	    	   //postStatusMessage("Saving specialties", "info")
	    	   toggleIonicLoading($ionicLoading, "Saving specialties", true, false, "assertive");
	    	   
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
		               call: "specialties/update/barber", values: barberID,
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
	                           
	                           //updateStatusMessage("Specialties saved successfully", "success");
	                           toggleIonicLoading($ionicLoading, "Specialties saved successfully", true, true, "balanced");
	                           
	                           $scope.cancelEditBarberSpecialties();

	                           $("#specialtyHeader").focus();

	                           $ionicScrollDelegate.scrollTop(true);
	                       }
	                   }else
	            	   {
	                	   //updateStatusMessage("Could not save specialties", "error");
	                	   toggleIonicLoading($ionicLoading, "Could not save specialties", true, true, "assertive");
	            	   }
	               }, function error(e) {
	                   if (e.status == 500 || e.status == 404) {
	                       toggleIonicLoading($ionicLoading, null, false);
	                   }
	               });
    		   }else
			   {
    			   //updateStatusMessage("Please select at least one specialty", "error");
    			   toggleIonicLoading($ionicLoading, "Please select at least one specialty", true, true, "assertive");
			   }
	       }
	       $scope.getSpecialties = function () {
	           $scope.specialties = MbsAPI.getSpecialties({
	               call: "specialties/gather"
	           },
	    	   	function (data) {
	    	   	    if (data && data.response.success) {
	    	   	        if (data.specialties) {
	    	   	            $(".specialties").remove();
	    	   	            $(".specialtyLabel").remove();
	    	   	            $(".specialtyBreak").remove();
	    	   	            $scope.specialties = [];
	    	   	            $scope.userSpecialties = [];

	    	   	            angular.forEach($scope.currentBarber.barberSpecialties, function (specialty, key) {
	    	   	                $scope.userSpecialties.push(specialty.specialty);
	    	   	                barberSpecialties[specialty.specialty] = specialty.specialtyID;
	    	   	            });

	    	   	            angular.forEach(data.specialties, function (specialty, key) {
	    	   	                $scope.specialties.push(specialty);

	    	   	                $("#barberSpecialtiesDiv").append(
                                     $("<li/>").addClass("item item-checkbox item-checkbox-right specialtyBreak mbsfont").append(
                                         specialty.specialty,
                                         $("<label/>").addClass("checkbox checkbox-assertive specialtyLabel")
                                                      .append(
                                             $("<input>").prop("type", "checkbox")
                                                         .prop("name", specialty.specialty)
                                                         .prop("value", specialty.specialtyID)
                                                         .attr("checked", $scope.userSpecialties.indexOf(specialty.specialty) > -1 ? true : false)
                                                         .addClass("specialties")
                                                         .click(function () {
                                                             if ($(this).is(":checked")) {
                                                                 barberSpecialties[$(this).prop("name")] = $(this).val();
                                                             } else
                                                                 barberSpecialties[$(this).prop("name")] = null;
                                                         })
                                         )
                                     )
                                )
	    	   	            });
	    	   	        }
	    	   	    }

	    	   	    //removeLoadingBar();
	    	   	    toggleIonicLoading($ionicLoading, null);
	    	   	}, function error(e) {
	    	   	    if (e.status == 500 || e.status == 404) {
	    	   	        toggleIonicLoading($ionicLoading, null, false);
	    	   	    }
	    	   	});
	       };
	       $scope.selectVacationDate = function (field) {
	          // $("#" + field).attr("min", new Date());
	           showCordovaDatePicker($cordovaDatePicker, $("#" + field));
	       };
	       
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
	       $scope.currentClients = ["1", "2", "3", "4", "5", "5+"];
	       
	       if($scope.apptTimes)
    	   {
	    	   angular.forEach($scope.apptTimes, function(time, key){
	    		  $(".normalTimeIn").append(
	    				  $("<option/>").append(
	    						  $("<a/>").prop("href", "#").text(time)
						  )
				  ) 
	    	   });
			  
	    	   $scope.apptTimes["00:00 AM"] = "OFF";
	    	   
	    	   angular.forEach($scope.apptTimes, function(time, key){
	    		  $(".barberhours").append(
	    				  $("<option/>").append(
	    						  $("<a/>").prop("href", "#").text(time)
						  )
				  ) 
	    	   });
    	   }
	       
	       /*angular.forEach($scope.yearsOfExperience, function(exp, key){
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
	    	   });*/
	       
	       $scope.getUser();
	       //$scope.getBarberDetails();
	       
	       //$rootScope.toggle("barberScheduleOverlay", "on");
	       
	       $(".barberhours").change(function()
		   {    		
	    	  var time; 
	    	  var pDiv;
	    	  
	    	  if($(this).attr("data-type").trim() == "Time In")
    		  {
	    		 if($(this).val().trim() == "OFF") 
	    		 {
	    			 pDiv =  $(this).parent().next(); 
	    		 
	    			 $(pDiv[0]).children("select").val("OFF");
	    		 }else
					  if($(this).parent().next().children("select").val() == "OFF")
					  {
						  $(this).parent().next().children("select").val("8:00 AM")
					  }
		    	  
				 if(scheduling[$(this).attr("value").toLowerCase()])
				 {
					 time = scheduling[$(this).attr("value").toLowerCase()].split("-");
					 
					 scheduling[$(this).attr("value").toLowerCase()] = $(this).val() == 'OFF' ? ("OFF - OFF") : (($(this).val() + " - ") + (time[1].trim() == "OFF" ? "Time Out" : time[1].trim()));
				 }
				 else
					 scheduling[$(this).attr("value").toLowerCase()] = $(this).val() == 'OFF' ? ("OFF - OFF") : ($(this).val() + " - ");
    		  }else
	    	      if ($(this).attr("data-type").trim() == "Time Out")
        		  {
    				  if($(this).val().trim() == "OFF")
    				  {
    					  pDiv =  $(this).parent().prev(); 
    					  
    					  $(pDiv[0]).children("select").val("OFF");
    				  }else
    					  if($(this).parent().prev().children("select").val() == "OFF")
						  {
    						  (this).parent().prev().children("select").val("8:00 AM")
						  }
    		    	  
    	    		 if(scheduling[$(this).attr("value").toLowerCase()])
    				 {
    					 time = scheduling[$(this).attr("value").toLowerCase()].split("-");
    					 
    					 scheduling[$(this).attr("value").toLowerCase()] = $(this).val() == 'OFF' ? ("OFF - OFF") : ((time[0].trim() == "OFF" ? "Time In" : time[0].trim()) + " - " + $(this).val());
    				 }
    				 else
    					 scheduling[$(this).attr("value").toLowerCase()] = $(this).val() == 'OFF' ? ("OFF - OFF") : (" - " + $(this).val());
        		  }
	    	  
			  //$(this).val($(this).val());
	       });
	       /*$(".specialties").change(function(){
	    	   alert($(this).val());
	       });*/
	       $(".normalTimeIn").change(function()
		   {    		
	    	   barberInfo.normalTimeIn = $(this).children(":selected").val().trim();
	    	  
			   //$(this).parent().parent().prev().text($(this).text());
	       });
	       $(".yearsOfExperience").change(function()
		   {    		
	    	   barberInfo.yearsOfExperience = $(this).children(":selected").val().trim();
	    	  
			   //$(this).parent().parent().prev().text($(this).text());
	       });
	       $(".avgCutTime").change(function()
		   {    		
	    	   barberInfo.avgCutTime = $(this).children(":selected").val().trim();
	    	  
			   //$(this).parent().parent().prev().text($(this).text());
	       });
	       $(".currentClients").change(function () {
	           barberStatus.currentClients = $(this).children(":selected").val().trim();
	       });
	       $(".timeIn").change(function () {
	           barberStatus.timeIn = $(this).children(":selected").val().trim();
	       });
	       $(".timeOut").change(function () {
	           barberStatus.timeOut = $(this).children(":selected").val().trim();
	       });

	       $scope.handleNotificationsClick = function () {
	           //getUserNotifications($scope, $ionicPopup);
	           $state.go('notifications');
	       }
	       $scope.handleNotificationClicked = function (notification) {
	           if (notification.title == "New Barber Shop Image") {
	               $state.go('gallery', { userID: notification.barberShopID, type: 'BarberShop' });
	           } else
	               if (notification.title == "New Customer") {
	                   $state.go('userprofile', { profileID: notification.profileID });
	               }
	       }
	       $rootScope.$on("HasNotifications", function () {
	           $scope.hasNotifications = true;
	       });
	   }])
	   .controller('sideViewController', ['$scope', 'MbsAPI', '$ionicLoading', '$state', '$stateParams', '$ionicPopup', '$ionicNavBarDelegate', '$filter', '$rootScope', function ($scope, MbsAPI, $ionicLoading, $state, $stateParams, $ionicPopup, $ionicNavBarDelegate, $filter, $rootScope) {
	       $scope.type = $stateParams.type;
	       $scope.screenHeight = (screen.height - (hasAds ? 50 : 0)) + "px";
	       $scope.hasNotifications = false;
	       $scope.sideViewData = [];

	       //gather the users profile information

	       $scope.getUser = function () {
	           //toggleIonicLoading($ionicLoading, "Loading shops...", true, false, "assertive");

	           $scope.userInfo = MbsAPI.getUserProfile({
	               call: "login/gather", values: $scope.mbsProfileID,
	               accountType: getAccountType($scope.mbsAccountType)
	           },
                   function (data) {
                       if (data && data.response.success) {
                           if (data.barber)
                               buildBarberProfile(data.barber, $scope);
                       } else {
                           //error getting user data
                       }
                   }, function error(e) {
                       if (e.status == 500 || e.status == 404) {
                           toggleIonicLoading($ionicLoading, null, false);
                       }
                   });
	       };

	       getUserData($scope);
	       getSideViewData($scope);

           setTimeout(function () {
                ionic.material.motion.ripple();
           }, 100);

	       $scope.getUser();

	       $scope.loadBarber = function (barber) {
	           $state.go("barber", { barberID: barber.barberID });
	       };
	       $scope.loadCustomer = function (customer) {
	           if (customer.profile.profileID == $scope.mbsProfileID) {
	               if (getAccountType($scope.mbsAccountType) == "Customer")
	                   $state.go('user', { profileID: $scope.mbsProfileID });
	               else
	                   $state.go('barberprofile', { barberID: $scope.currentBarber.barberID });
	           } else
	               $state.go("userprofile", { profileID: customer.profile.profileID });
	           //$state.go("userprofile", { profileID: customer.profile.profileID });
	       };
	       $scope.loadAppointment = function (barber) {
	           $state.go('appointment', { barberID: barber.barberID, barberProfileID: barber.profileID });
	       };
	       $scope.loadClient = function (client) {
	           if (client.profile.profileID == $scope.mbsProfileID) {
	               if (getAccountType($scope.mbsAccountType) == "Customer")
	                   $state.go('user', { profileID: $scope.mbsProfileID });
	               else
	                   $state.go('barberprofile', { barberID: $scope.currentBarber.barberID });
	           } else
	               $state.go("userprofile", { profileID: client.profile.profileID });
	       };
	       $scope.handleNotificationsClick = function () {
	           $state.go('notifications');
	       }
	       $scope.handleNotificationClicked = function (notification) {
	           if (notification.title == "New Barber Shop Image") {
	               $state.go('gallery', { userID: notification.barberShopID, type: 'BarberShop' });
	           } else
	               if (notification.title == "New Customer") {
	                   $state.go('userprofile', { profileID: notification.profileID });
	               }
	       }
	       $rootScope.$on("HasNotifications", function () {
	           $scope.hasNotifications = true;
	       });
	   }])
	   .controller('appointmentController', ['$scope', 'MbsAPI', '$stateParams', '$location', '$state', '$ionicLoading', '$ionicPopup', '$filter', '$timeout', '$rootScope', '$cordovaDialogs', '$cordovaCalendar', function ($scope, MbsAPI, $stateParams, $location, $state, $ionicLoading, $ionicPopup, $filter, $timeout, $rootScope, $cordovaDialogs, $cordovaCalendar) {
	       
	       $scope.eventSources = [];
	       $scope.screenHeight = (screen.height - (hasAds ? 50 : 0)) + "px";
	       $scope.hasNotifications = false;
	       
	       var searchObject = $location.search();
	       var barberID = $stateParams.barberID, barberProfileID = $stateParams.barberProfileID, apptType = $stateParams.apptType;

	       $scope.alertOnDayClick = function (date, jsEvent, view) {
	           $scope.getAppointmentDetails(date, jsEvent, true);
	       };

	       $scope.alertOnEventClick = function (event, allDay, jsEvent, view) {
	           $scope.getAppointmentDetails(event.start, jsEvent);
	       };
	       /* alert on Drop */
	       $scope.alertOnDrop = function (event, revertFunc, jsEvent, ui, view) {
	           $scope.alertMessage = ('Event Droped on ' + event.start.format());
	       };
	       /* alert on Resize */
	       $scope.alertOnResize = function (event, jsEvent, ui, view) {
	           $scope.alertMessage = ('Event end date was moved to ' + event.end.format());
	       };

	       $scope.modifyDay = function (date, cell) {
	           cell.parent().parent().next("tbody").attr("ng-click", "dayClicked()");
	           //cell.css('background-color', 'red');

	           return cell;
	       };

	       $scope.dayClicked = function () {
	           alert('hi');
	       };

	       $scope.calendarEvents = [];

	       $scope.calendarConfig = {
	           calendar: {
	               height: 490,
	               editable: false,
	               header: {
	                   left: 'title',
	                   right: 'prev,next'
	               },
	               dayClick: $scope.alertOnDayClick,
	               eventDrop: $scope.alertOnDrop,
	               eventClick: $scope.alertOnEventClick,
	               timeFormat: ''/*,
                   dayRender: $scope.modifyDay*/,
	               eventLimit: 2
	           }
	       };

	       $scope.getUser = function () {
	           $scope.profileInfo = MbsAPI.getUserProfile({
	               call: "profile/gather/details", profileID: $scope.mbsProfileID
	           },
                    function (data) {
                        if (data && data.response.success) {
                            buildProfile(data, $scope);

                            toggleIonicLoading($ionicLoading, null, false);
                        } else {
                            //error getting user data
                        }
                    }, function error(e) {
                        if (e.status == 500 || e.status == 404) {
                            toggleIonicLoading($ionicLoading, null, false);
                        }
                    });
	       }
	       $scope.getBarberAppointments = function () {
	           toggleIonicLoading($ionicLoading, "Loading appointments...", true, false, "assertive");

	           $scope.barberAppointments = MbsAPI.getBarberAppointments({
	               call: "appointment/gather/barber", barberID: barberID
	           },
                   function (data) {
                       if (data && data.response.success) 
                       {
                    	   if (data.member) 
                        	   buildBarberProfile(data.member, $scope);
                               
                           if (data.appointment) 
                           {
                        	   buildBarberProfile(data.member, $scope);
                               buildAppointments(data.appointment, $scope, null, false);
                               
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
                                           currentAppointment.image = appointment.appointmentImage;
                                       }
                                       else
                                    	   if(appointment.profile)
                                    	   {
                                    		   currentAppointment.title = appointment.profileID != 0 ? appointment.profile.displayName : appointment.displayName;
                                    		   currentAppointment.image = appointment.appointmentImage;
                                    	   }
                                       
                                       currentAppointment.color = appointment.wasCancelled == "true" ? "red" : "green";
                                       currentAppointment.status = appointment.wasCancelled == "true" ? "Cancelled" : "Accepted";
                                       currentAppointment.start = splitDate(appointment.appointmentDate);
                                       
                                       var time = splitDate(appointment.appointmentDate);
                                       
                                       appointment["time"] = getReadableTime(time);
                                       currentAppointment.time = getReadableTime(time);
                                       currentAppointment.end = splitDate(appointment.appointmentDate);
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
                            	   vacation.start = splitDate($scope.currentBarber.barberStatus.vacationStartDate);
                                   vacation.status = "Vacation";
                                   vacation.end = moment(splitDate($scope.currentBarber.barberStatus.vacationEndDate));//.add(1, "days");

                                   $scope.calendarEvents.push(vacation);
                        	   }
                            	   
                        	   //initializeCalendar();
                           }

                           $scope.getUser();
                       }
                       
                       //removeLoadingBar();
                       $scope.eventSources.push($scope.calendarEvents);
                   }, function error(e) {
                       if (e.status == 500 || e.status == 404) {
                           toggleIonicLoading($ionicLoading, null, false);
                       }
                   });
	       }
	       $scope.createAppointment = function (apptDate) {
	          // $scope.appointmentPopup.close();
	           //postStatusMessage("Creating Appointment", "info");
	           toggleIonicLoading($ionicLoading, "Creating appointment", true, false, "assertive");
	    	   
	           $scope.userAppt = MbsAPI.createAppointment({
	               call: "appointment/create", values: $scope.mbsProfileID,
	               appointmentDate: createJavaDate(apptDate, true),
	               appointmentStatus: "Accepted", 
	               barberID: $scope.currentBarber.barberID,
	               barberProfileID: barberProfileID,
                   displayName: $scope.mbsDisplayName
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
                                data.appointment["wasCancelled"] = "false";

                                currentAppointment.image = getProfileImage($scope.currentProfile.image, "profile", "avatar");
                                data.appointment.appointmentImage = getProfileImage($scope.currentProfile.image, "profile", "avatar");

                                currentAppointment.title = $scope.mbsDisplayName;
                                data.appointment.displayName = $scope.mbsDisplayName;
                                currentAppointment.color = "green";
                                currentAppointment.status = "Accepted";
                                currentAppointment.start = splitDate(data.appointment.appointmentDate);
                                
                                var time = splitDate(data.appointment.appointmentDate);
                                
                                currentAppointment.time = getReadableTime(time);
                                data.appointment.time = getReadableTime(time);
                                currentAppointment.end = splitDate(data.appointment.appointmentDate);
                                currentAppointment.appointmentStatus = data.appointment.appointmentStatus;

                                $scope.calendarEvents.push(currentAppointment);  
                                $scope.currentAppointments.push(data.appointment);  
                                
                                toggleIonicLoading($ionicLoading, "Appointment created", true, true, "balanced");
                     	   }
                       } else {
                           toggleIonicLoading($ionicLoading, "Couldn't Create Appointment", true, true, "assertive");
                       }

                   }, function error(e) {
                       if (e.status == 500 || e.status == 404) {
                           toggleIonicLoading($ionicLoading, null, false);
                       }
                   });
	       }
	       $scope.deleteAppointment = function (appt) {
	           $scope.appointmentPopup.close();

	           //postStatusMessage("Cancelling Appointment", "info");
	           toggleIonicLoading($ionicLoading, "Cancelling appointment", true, false, "assertive");

	           $scope.cancelAppt = MbsAPI.deleteAppointment({
	               call: "appointment/delete", values: $scope.mbsProfileID,
	               appointmentID: appt.appointmentID,
	               appointmentStatus: "Cancelled"
	           },
                   function (data) {
                       if (data && data.response.success) {
                           if (data.appointment) {
                               if ($scope.calendarEvents) {
                                   angular.forEach($scope.calendarEvents, function (event, key) {
                                       if (event.id == data.appointment.appointmentID) {
                                           event.appointmentStatus = data.appointment.appointmentStatus;
                                           event.status = "Cancelled";
                                           event.color = "red";
                                           event.wasCancelled = "true";

                                           $("#appointmentCalendar").fullCalendar('renderEvents');
                                           //$scope.calendarConfig.calendar.fullCalendar('updateEvent', event);
                                       }

                                   });
                               }

                               if ($scope.currentAppointments) {
                                   angular.forEach($scope.currentAppointments, function (appointment, key) {
                                       if (appointment.appointmentID == data.appointment.appointmentID) {
                                           appointment.appointmentStatus = data.appointment.appointmentStatus;
                                           appointment.wasCancelled = "true";
                                       }

                                   });
                               }

                               //initializeCalendar();

                               //updateStatusMessage("Appointment Cancelled", "success");
                               toggleIonicLoading($ionicLoading, "Appointment Cancelled", true, true, "balanced");
                           }
                       } else {
                           //updateStatusMessage("Couldn't Cancel Appointment", "error");
                           toggleIonicLoading($ionicLoading, "Couldn't Cancel Appointment", true, true, "assertive");
                       }

                       //showNavigation("search");
                   }, function error(e) {
                       if (e.status == 500 || e.status == 404) {
                           toggleIonicLoading($ionicLoading, null, false);
                       }
                   });
	       };
	       $scope.extraEventSignature = function (event) {
	           return event.color;
	       };

	       getUserData($scope);
	       
	       $scope.getBarberAppointments();

	       /*$ionicPopover.fromTemplateUrl('/templates/appointment-popover.html', {
               scope: $scope,
	       }).then(function(popover){
	           $scope.popover = popover;
	       });*/

	       $scope.$cordovaDialogs = $cordovaDialogs;

	       $scope.getAppointmentDetails = function (date, event, addDays) {
	           if($scope.currentAppointments && date)
	           {
	                //var apts = $scope.currentAppointments;

	                $scope.apts = new Array();
	               
                    if(addDays)
                        date.add(1, 'days').calendar();
                   else
                        date.add(0, 'days').calendar();

                    var newDate = new Date(date.format());

	                $scope.selectedDate = newDate;
	                $scope.selectedDateOnly = formatDateNoTime2(newDate);

	                $scope.apts = $filter('filter')($scope.currentAppointments, { appointmentDate: newDate }, function (actual, expected) {
	                    var date = splitDate(actual);

	                    return date.getYear() === expected.getYear() && date.getMonth() === expected.getMonth() && date.getDate() === expected.getDate();
	                });

	                $scope.availableApptTimes = getAvailableAppointmentTimes($scope, newDate, $scope.apts, null, null, $filter);
	           }

	           if ($scope.availableApptTimes != false) {
	               //$scope.appointmentPopup = $ionicPopup.show({
	               //    templateUrl: 'templates/appointment-popover.html',
	               //    //title: 'Appointments',
	               //    scope: $scope
	               //});

	               //$scope.appointmentPopup.then(function (res) {
	               //    var s = ";;";
	               //});
	               saveApptData($scope.apts, $scope.availableApptTimes, $scope.selectedDate, $scope.selectedDateOnly);

	               $state.go("createappointment", { barberID: barberID, barberProfileID: barberProfileID, apptType: apptType });
	           }

	           //var p = $(".popup").css("width");

	           //$scope.screenWidth = (screen.width - 75) + "px";

	           //$(".popup").css({
	           //    "height": "200px",
               //    "width": "50px"
	           // });
	       };

	       var apptVisible = true;

	       $scope.confirmAppointment = function (apptTime) {
	           var confirmPopup = $cordovaDialogs.confirm('Set appointment for this time? ' + apptTime,
                   'Confirm Appointment', ["OK", "Cancel"]).then(function (res) {
                       if (res == 1) {
                           scheduleAppointment($scope.selectedDate, apptTime, $ionicPopup, $timeout);
                       } //else
                       //confirmPopup.close();
                   });
	       };

	       $scope.toggleAppointments = function () {
	           if(apptVisible)
	           {
	               apptVisible = false;
	               $("#appointmentsView").css("display", "none");
	               $("#createView").css("display", "block");
	               $("#headerTitle").text("Available times");
	           }else
	           {
	               apptVisible = true;
	               $("#appointmentsView").css("display", "block");
	               $("#createView").css("display", "none");
	               $("#headerTitle").text($scope.selectedDateOnly);
	           }
	       };

	       $scope.handleNotificationsClick = function () {
	           //getUserNotifications($scope, $ionicPopup);
	           $state.go('notifications');
	       }
	       $scope.handleNotificationClicked = function (notification) {
	           if (notification.title == "New Barber Shop Image") {
	               $state.go('gallery', { userID: notification.barberShopID, type: 'BarberShop' });
	           } else
	               if (notification.title == "New Customer") {
	                   $state.go('userprofile', { profileID: notification.profileID });
	               }
	       }
	       $rootScope.$on("HasNotifications", function () {
	           $scope.hasNotifications = true;
	       });
	       $scope.$on("$ionicView.enter", function () {
	           getNewAppointments($scope);
	           clearNewAppointmentsData();

	           if($scope.calendarNewEvents)
	           {
	               angular.forEach($scope.calendarNewEvents, function (event, key) {
	                   if (event.appointmentStatus && event.appointmentStatus.appointmentStatus == "Cancelled")
	                   {
	                       angular.forEach($scope.calendarEvents, function (oldEvent, oldKey) {
	                           if(oldEvent.id == event.appointmentID)
	                           {
	                               oldEvent.appointmentStatus = event.appointmentStatus;
	                               oldEvent.status = "Cancelled";
	                               oldEvent.color = "red";
	                               oldEvent.wasCancelled = "true";
	                           }
	                       });
	                   }else
	                        $scope.calendarEvents.push(event);
	               });
	           }
	           if ($scope.currentNewAppointments) {
	               angular.forEach($scope.currentNewAppointments, function (appt, key) {
	                   if (appt.appointmentStatus && appt.appointmentStatus.appointmentStatus == "Cancelled") {
	                       angular.forEach($scope.currentAppointments, function (oldAppt, oldKey) {
	                           if (oldAppt.appointmentID == appt.appointmentID) {
	                               oldAppt.appointmentStatus = appt.appointmentStatus;
	                               oldAppt.wasCancelled = "true";
	                           }
	                       });
	                   } else
	                       $scope.currentAppointments.push(appt);
	               });
	           }

	           $scope.calendarNewEvents = $scope.currentNewAppointments = null;
	       });
	   }])
	   .controller('createAppointmentController', ['$scope', 'MbsAPI', '$stateParams', '$location', '$state', '$ionicLoading', '$ionicPopup', '$filter', '$timeout', '$rootScope', '$cordovaDialogs', '$ionicListDelegate', '$ionicScrollDelegate', function ($scope, MbsAPI, $stateParams, $location, $state, $ionicLoading, $ionicPopup, $filter, $timeout, $rootScope, $cordovaDialogs, $ionicListDelegate, $ionicScrollDelegate) {

	       $scope.eventSources = [];
	       $scope.screenHeight = (screen.height - (hasAds ? 50 : 0)) + "px";
	       $scope.hasNotifications = false;
	       $scope.calendarEvents = [], $scope.currentAppointments = [];

	       var searchObject = $location.search();
	       var barberID = $stateParams.barberID, barberProfileID = $stateParams.barberProfileID, apptType = $stateParams.apptType;

	       getApptData($scope);
	       clearApptData();

	       if ($scope.selectedDateOnly != formatDateNoTime2($scope.selectedDate)) {
	           $scope.selectedDate = moment($scope.selectedDate).toDate();
	       }

	       setTimeout(function () {
	           ionic.material.motion.ripple();
	       }, 500);
           
	       $scope.getUser = function () {
	           $scope.profileInfo = MbsAPI.getUserProfile({
	               call: "profile/gather/details", profileID: $scope.mbsProfileID
	           },
                    function (data) {
                        if (data && data.response.success) {
                            buildProfile(data, $scope);

                            toggleIonicLoading($ionicLoading, null, false);
                        } else {
                            //error getting user data
                        }
                    }, function error(e) {
                        if (e.status == 500 || e.status == 404) {
                            toggleIonicLoading($ionicLoading, null, false);
                        }
                    });
	       }
	       $scope.getBarberAppointments = function () {
	           toggleIonicLoading($ionicLoading, "Loading appointments...", true, false, "assertive");

	           $scope.barberAppointments = MbsAPI.getBarberAppointments({
	               call: "appointment/gather/barber", barberID: barberID
	           },
                   function (data) {
                       if (data && data.response.success) {
                           if (data.member)
                               buildBarberProfile(data.member, $scope);

                           if (data.appointment) {
                               buildBarberProfile(data.member, $scope);
                               buildAppointments(data.appointment, $scope, null, false);

                               $scope.apptTimes = {};
                               $scope.barberSchedule = $scope.currentBarber.barberSchedule != null && $scope.currentBarber.barberSchedule.barberScheduleID > 0 ?
                            		   				   $scope.currentBarber.barberSchedule : {};

                               getDefaultApptTimes($scope);

                               if ($scope.currentAppointments) {
                                   angular.forEach($scope.currentAppointments, function (appointment, key) {
                                       var currentAppointment = new Object();

                                       currentAppointment.id = appointment.appointmentID;
                                       currentAppointment.barberID = appointment.barberID;
                                       currentAppointment.profileID = appointment.profileID;
                                       currentAppointment.wasCancelled = appointment.wasCancelled;

                                       if (appointment.barber) {
                                           currentAppointment.title = appointment.barber.profile.displayName;
                                           currentAppointment.image = appointment.appointmentImage;
                                       }
                                       else
                                           if (appointment.profile) {
                                               currentAppointment.title = appointment.profile.displayName;
                                               currentAppointment.image = appointment.appointmentImage;
                                           }

                                       currentAppointment.color = appointment.wasCancelled == "true" ? "red" : "green";
                                       currentAppointment.status = appointment.wasCancelled == "true" ? "Cancelled" : "Accepted";
                                       currentAppointment.start = splitDate(appointment.appointmentDate);

                                       var time = splitDate(appointment.appointmentDate);

                                       appointment["time"] = getReadableTime(time);
                                       currentAppointment.time = getReadableTime(time);
                                       currentAppointment.end = splitDate(appointment.appointmentDate);
                                       currentAppointment.appointmentStatus = appointment.appointmentStatus;

                                       $scope.calendarEvents.push(currentAppointment);
                                   });
                               }

                               if ($scope.currentBarber.barberStatus.vacationStartDate && $scope.currentBarber.barberStatus.vacationEndDate) {
                                   var vacation = new Object();

                                   vacation.id = 0;
                                   vacation.barberID = $scope.currentBarber.barberID;

                                   vacation.class = "event-info";
                                   vacation.start = splitDate($scope.currentBarber.barberStatus.vacationStartDate);
                                   vacation.status = "Vacation";
                                   vacation.end = moment(splitDate($scope.currentBarber.barberStatus.vacationEndDate)).add(1, "days");

                                   $scope.calendarEvents.push(vacation);
                               }

                               //initializeCalendar();
                           }

                           $scope.getUser();
                       }

                       $scope.eventSources.push($scope.calendarEvents);
                   }, function error(e) {
                       if (e.status == 500 || e.status == 404) {
                           toggleIonicLoading($ionicLoading, null, false);
                       }
                   });
	       }
	       $scope.createAppointment = function (apptDate) {
	           //$scope.appointmentPopup.close();
	           toggleIonicLoading($ionicLoading, "Creating appointment", true, false, "assertive");

	           $scope.userAppt = MbsAPI.createAppointment({
	               call: "appointment/create", values: $scope.clientName != null ? 0 : $scope.mbsProfileID,
	               appointmentDate: createJavaDate(apptDate, true),
	               appointmentStatus: "Accepted",
	               barberID: barberID,
	               barberProfileID: barberProfileID,
	               displayName: $scope.clientName != null ? $scope.clientName : $scope.mbsDisplayName,
	               clientName: $scope.clientName ? $scope.clientName : $scope.mbsDisplayName
	           },
                   function (data) {
                       if (data && data.response.success) {
                           if (data.appointment) {
                               var currentAppointment = new Object();

                               currentAppointment.id = data.appointment.appointmentID;
                               currentAppointment.barberID = data.appointment.barberID;
                               currentAppointment.profileID = data.appointment.profileID;
                               currentAppointment.wasCancelled = "false";
                               data.appointment["wasCancelled"] = "false";

                               currentAppointment.image = $scope.clientName != null ? getProfileImage(null, "") : getProfileImage($scope.currentProfile.image, "", "avatar");
                               data.appointment.appointmentImage = $scope.clientName != null ? getProfileImage(null, "") : getProfileImage($scope.currentProfile.image, "", "avatar");

                               currentAppointment.title = $scope.clientName != null ? $scope.clientName : $scope.mbsDisplayName;
                               data.appointment.displayName = $scope.clientName != null ? $scope.clientName : $scope.mbsDisplayName;
                               currentAppointment.color = "green";
                               currentAppointment.status = "Accepted";
                               currentAppointment.start = splitDate(data.appointment.appointmentDate);

                               var time = splitDate(data.appointment.appointmentDate);

                               currentAppointment.time = getReadableTime(time);
                               data.appointment.time = getReadableTime(time);
                               currentAppointment.end = splitDate(data.appointment.appointmentDate);
                               currentAppointment.appointmentStatus = data.appointment.appointmentStatus;

                               $scope.calendarEvents.push(currentAppointment);
                               $scope.currentAppointments.push(data.appointment);
                               $scope.apts.push(data.appointment);

                               $(".item-radio").each(function () {
                                   if ($(this).children("div").text().trim() == currentAppointment.time) {
                                       $(this).children("input").prop("disabled", true);
                                       $(this).children("input").prop("selected", false);
                                   }
                               });

                               $scope.availableApptTimes[currentAppointment.time] = currentAppointment.time + " - Taken";

                               saveNewAppointments($scope.calendarEvents, $scope.currentAppointments);

                               toggleIonicLoading($ionicLoading, "Appointment created", true, true, "balanced");
                           }
                       } else {
                           toggleIonicLoading($ionicLoading, "Couldn't Create Appointment", true, true, "assertive");
                       }

                   }, function error(e) {
                       if (e.status == 500 || e.status == 404) {
                           toggleIonicLoading($ionicLoading, null, false);
                       }
                   });
	       }
	       $scope.deleteAppointment = function (appt) {
	          // $scope.appointmentPopup.close();

	           toggleIonicLoading($ionicLoading, "Cancelling appointment", true, false, "assertive");

	           $scope.cancelAppt = MbsAPI.deleteAppointment({
	               call: "appointment/delete", values: $scope.mbsProfileID,
	               appointmentID: appt.appointmentID,
	               appointmentStatus: "Cancelled"
	           },
                   function (data) {
                       if (data && data.response.success) {
                           if (data.appointment) {
                               if ($scope.apts) {
                                   angular.forEach($scope.apts, function (appts, key) {
                                       if (appts.appointmentID == data.appointment.appointmentID) {
                                           appts.appointmentStatus = data.appointment.appointmentStatus;
                                           appts.status = "Cancelled";
                                           appts.color = "red";
                                           appts.wasCancelled = "true";
                                       }

                                   });
                               }

                               //if ($scope.currentAppointments) {
                               //    angular.forEach($scope.currentAppointments, function (appointment, key) {
                               //        if (appointment.appointmentID == data.appointment.appointmentID) {
                               //            appointment.appointmentStatus = data.appointment.appointmentStatus;
                               //            appointment.wasCancelled = "true";
                               //        }

                               //    });
                               //}

                               $ionicListDelegate.closeOptionButtons();

                               $scope.calendarEvents.push(data.appointment);
                               $scope.currentAppointments.push(data.appointment);

                               saveNewAppointments($scope.calendarEvents, $scope.currentAppointments);

                               toggleIonicLoading($ionicLoading, "Appointment Cancelled", true, true, "balanced");
                           }
                       } else {
                           toggleIonicLoading($ionicLoading, "Couldn't Cancel Appointment", true, true, "assertive");
                       }

                   }, function error(e) {
                       if (e.status == 500 || e.status == 404) {
                           toggleIonicLoading($ionicLoading, null, false);
                       }
                   });
	       };

	       getUserData($scope);

	       $scope.getUser();
	       //$scope.getBarberAppointments();

	       $scope.$cordovaDialogs = $cordovaDialogs;

	       var apptVisible = true;

	       $scope.confirmAppointment = function (apptTime) {
	           if (apptType == "Barber") {
	               var confirmPopup = $cordovaDialogs.prompt('Set appointment for this time? ' + apptTime + "\n Client Name:",
                   'Confirm Appointment', ["OK", "Cancel"]).then(function (res) {
                       if (res.input1 != null && res.input1 != undefined) {
                           $scope.clientName = res.input1;
                           scheduleAppointment($scope.selectedDate, apptTime, $ionicPopup, $timeout);
                       }
                   });
	           }else
	           {
	               var confirmPopup = $cordovaDialogs.confirm('Set appointment for this time? ' + apptTime,
                   'Confirm Appointment', ["OK", "Cancel"]).then(function (res) {
                       if (res == 1) {
                           $scope.clientName = null;
                           scheduleAppointment($scope.selectedDate, apptTime, $ionicPopup, $timeout);
                       }
                   });
	           }
	           //$scope.clientName = "Jay";
	           //scheduleAppointment($scope.selectedDate, apptTime, $ionicPopup, $timeout);
	       };

	       $scope.toggleAppointments = function () {
	           if (apptVisible) {
	               apptVisible = false;
	               $("#appointmentsView").css("display", "none");
	               $("#createView").css("display", "block");
	               $("#headerTitle").text("Available times");
	               $("#apptButton").removeClass($scope.clockIcon);
	               $("#apptButton").addClass($scope.appointmentIcon);
	           } else {
	               apptVisible = true;
	               $("#appointmentsView").css("display", "block");
	               $("#createView").css("display", "none");
	               $("#headerTitle").text($scope.selectedDateOnly);
	               $("#apptButton").removeClass($scope.appointmentIcon);
	               $("#apptButton").addClass($scope.clockIcon);
	               $ionicScrollDelegate.scrollTop(true);
	               ionic.material.motion.ripple();
	           }
	       };
	       tScope = $scope;
	   }])
        .controller('galleryController', ['$scope', 'MbsAPI', '$stateParams', '$location', '$ionicLoading', '$ionicNavBarDelegate', '$ionicSlideBoxDelegate', '$ionicActionSheet', 'camera', '$cordovaCamera', '$ionicPopup', '$cordovaActionSheet', '$rootScope', '$state', '$cordovaFileTransfer', '$cordovaDialogs', '$ionicScrollDelegate', '$ionicHistory', '$ionicModal', function ($scope, MbsAPI, $stateParams, $location, $ionicLoading, $ionicNavBarDelegate, $ionicSlideBoxDelegate, $ionicActionSheet, camera, $cordovaCamera, $ionicPopup, $cordovaActionSheet, $rootScope, $state, $cordovaFileTransfer, $cordovaDialogs, $ionicScrollDelegate, $ionicHistory, $ionicModal) {
            
            var userID = $stateParams.userID;
            var type = $stateParams.type;
            var hideSheet, addToShop;
            $scope.hasNotifications = false;
            $scope.canUpload = false;
            $scope.canModify = false;
            $scope.imageCaption;
            $scope.currentImageIndex = 0;
            $scope.screenHeight = (screen.height - (hasAds ? 50 : 0)) + "px";
            
            $scope.getUser = function () {

                //showLoadingBar("Loading Profile...");
                toggleIonicLoading($ionicLoading, "Loading gallery...", true, false, "assertive");

                if (type == "Barber" || isBarber($scope.mbsAccountType))
                {
                    $scope.profileInfo = MbsAPI.getBaberProfile({
                        call: "barber/gather/details", barberID: $scope.mbsBarberID != null ? $scope.mbsBarberID : userID
                    },
                    function (data) {
                        if (data && data.response.success) {
                            buildBarberProfile(data.member, $scope);

                            if (type == "Barber") {
                                handleImages($scope.imageInfo);
                            }

                            $scope.splitImages();
                        } else {
                            //error getting user data
                        }

                        if (type == "BarberShop") {
                            if ($scope.currentBarber) {
                                if ($scope.currentBarber.barberShopID == userID)
                                    $scope.canUpload = true;
                            }

                            $scope.getBarberShopDetails();
                            $scope.canModify = true;
                        }
                        else
                            toggleIonicLoading($ionicLoading, null, false);
                    }, function error(e) {
                        if (e.status == 500 || e.status == 404) {
                            toggleIonicLoading($ionicLoading, null, false);
                        }
                    });
                } else
                {
                    $scope.profileInfo = MbsAPI.getUserProfile({
                        call: "profile/gather/details", profileID: $scope.mbsProfileID//profileID
                    },
                    function (data) {
                        if (data && data.response.success) {
                            buildProfile(data, $scope);

                            $scope.splitImages();
                        } else {
                            //error getting user data
                        }

                        if (type == "BarberShop") {
                            if ($scope.currentProfile && $scope.currentProfile.barberShop) {
                                angular.forEach($scope.currentProfile.barberShop, function (shop, key) {
                                    if (shop.barberShopID == userID)
                                        $scope.canUpload = true;
                                });
                            }

                            $scope.getBarberShopDetails();
                            $scope.canModify = false;
                        }
                        else
                            toggleIonicLoading($ionicLoading, null, false);
                    }, function error(e) {
                        if (e.status == 500 || e.status == 404) {
                            toggleIonicLoading($ionicLoading, null, false);
                        }
                    });
                }
            };
            $scope.getBarberShopDetails = function () {
                $scope.shopInfo = MbsAPI.getBarberShopDetails({
                    call: "barbershop/gather/details", barberShopID: userID
                },
                    function (data) {
                        if (data && data.response.success) {
                            if (data.barberShop) {
                                buildBarberShopDetail(data.barberShop, $scope);

                                if (!$scope.imageInfo) {
                                    handleImages($scope.currentBarberShops[0].images);

                                    $scope.imageInfo = $scope.currentBarberShops[0].images;
                                }
                            }

                            $scope.splitImages();
                        }

                        toggleIonicLoading($ionicLoading, null, false);

                    }, function error(e) {
                        if (e.status == 500 || e.status == 404) {
                            toggleIonicLoading($ionicLoading, null, false);
                        }
                    });
            };
            $scope.changeImage = function (index) {
                $scope.currentImageIndex = index;
            };
            $scope.handleImageClick = function () {
                $scope.wasTapped = !$scope.wasTapped;

               // $("#closeButton").css("display", "initial");
                //$ionicNavBarDelegate.showBar($scope.wasTapped);
                //$ionicNavBarDelegate.align('left');
            };
            $scope.handleThumbnailClick = function (image) {
                //$ionicNavBarDelegate.showBar(false);
                $ionicScrollDelegate.scrollTop(true);

                for(var i = 0; i < $scope.imageInfo.length; i++)
                {
                    if ($scope.imageInfo[i].imageID == image.imageID) {
                        //$("#gridMode").css("display", "none");
                        /*$scope.showGridMode = false;
                        $("#fullScreenMode").css("display", "block");
                        $ionicSlideBoxDelegate.update();
                        $ionicSlideBoxDelegate.slide(i);

                        $("#scrollingContent").attr("scroll", false);*/

                        $scope.activeSlide = i;

                        $ionicModal.fromTemplateUrl("templates/image-popover.html", {
                            scope: $scope,
                            animation: 'slide-in-up'
                        }).then(function (modal) {
                            $scope.modal = modal;
                            $scope.modal.show();
                        });
                    }
                }
            };
            $scope.closeModal = function () {
                $scope.modal.hide();
                $scope.modal.remove()
            };
            $scope.handleExitClick = function () {
                $("#fullScreenMode").css("display", "none");
                //$("#gridMode").css("display", "inline");
                $scope.showGridMode = true;
                $scope.wasTapped = false;

                $("#scrollingContent").attr("scroll", true);

                $ionicNavBarDelegate.showBar(true);

                playEffect();
            };
            $scope.goBack = function () {
                $ionicHistory.goBack();
            };
            $scope.uploadImageHandler = function()
            {
            	hideSheet = showCordovaActionSheet($cordovaActionSheet, 
            			            ["Take Photo", "Photo Library", "Photo Album"],
            			            "Upload Image",
            			            null,
            			            null,
            			            uploadButtonHandler
    			            );
            };
            $scope.imageSettingsHandler = function (imageIndex) {
                for(var i = 0; i < $scope.imageInfo.length; i++)
                {
                    var image = $scope.imageInfo[i];

                    if(image.imageID == imageIndex)
                       $scope.currentImageIndex = i;
                        
                }

                hideSheet = showCordovaActionSheet($cordovaActionSheet,
            			            [ type == "BarberShop" ? "Set as Shop Profile Image" : "Set as Profile Image", type == "Barber" ? "Set Aas Background Image" : ""],
            			            "Modify Image",
            			            "Delete Image",
            			            deleteImageHandler,
            			            makeDefaultButtonHandler
    			            );
            };
            $scope.cancelImageUpload = function()
            {
                $("#galleryContainer").css("display", "block");
                $("#galleryUploadContainer").css("display", "none");

                $ionicScrollDelegate.scrollTop(true);
            }

            getUserData($scope);

            getImageData($scope);
            $scope.wasTapped = false;
            $scope.showGridMode = true;
            $scope.canUpload = $scope.mbsProfileID == userID ? true : false;
            $scope.canModify = $scope.mbsProfileID == userID ? true : false;

            if ($scope.imageInfo.length == 0) {
                $("#imageContainer").css("display", "none");
                $("#noImageContainer").css("display", "block");
            }
            else {
                $("#imageContainer").css("display", "block");
                $("#noImageContainer").css("display", "none");
            }

            $(".slider").css("height", (screen.height - (hasAds ? 50 : 0)) + "px");
            
            function uploadButtonHandler(index, clickedButton)
            {
            	var sourceType, mediaType; 
            	
            	if(index == 1)// || clickedButton.text == "Take Photo")
        		{
            		sourceType = Camera.PictureSourceType.CAMERA;
        		}else
            	    if (index == 2)// || clickedButton.text == "Photo Library")
    				{
        				sourceType = Camera.PictureSourceType.PHOTOLIBRARY;
        				mediaType = Camera.MediaType.PICTURE;
    				}
        			else
            	        if (index == 3)// || clickedButton.text == "Photo Album")
        				{
            				sourceType = Camera.PictureSourceType.SAVEDPHOTOALBUM;
							mediaType = Camera.MediaType.PICTURE;
            	        }
            	
            	if (index != 4) {
            	    var targetWidth = screen.width, targetHeight = (screen.height - (hasAds ? 50 : 0)) - 240;

            	    var options = {
            	        quality: 100,
            	        destinationType: Camera.DestinationType.FILE_URI,
            	        sourceType: sourceType,
            	        allowEdit: true,
            	        encodingType: Camera.EncodingType.JPEG,
            	        targetWidth: targetWidth,
            	        targetHeight: targetHeight,
            	        //popoverOptions: CameraPopoverOptions,
            	        saveToPhotoAlbum: false,
            	        correctOrientation: true
            	    };

            	    if (mediaType)
            	        options.mediaType = mediaType;

            	    $cordovaCamera.getPicture(options).then(function (imageData) {
            	        // Success! Image data is here
            	        $("#galleryContainer").css("display", "none");
            	        $("#galleryUploadContainer").css("display", "block");

            	        $scope.imageHeight = (screen.height - (hasAds ? 50 : 0)) - 240;
            	        $scope.selectedImage = imageData;//"data:image/jpeg;base64," + imageData;

            	        $ionicScrollDelegate.scrollTop(true);

            	    }, function (err) {
            	        // An error occurred. Show a message to the user
            	        console.log(err);
            	    });
            	}

            	return true;
            }

            function makeDefaultButtonHandler(index, clickedButton) {
                if (index == 1)
                    deleteImageHandler();
                else if (index == 2)
                {
                    var image = $scope.imageInfo[$scope.currentImageIndex];
                    var oldProfileImageID, newProfileImageID;

                    toggleIonicLoading($ionicLoading, "Updating profile image...", true, false, "assertive");

                    if (type == "BarberShop") {
                        MbsAPI.updateBarberShopProfileImage({
                            call: "images/update/barbershop/profile/image", values: $scope.mbsProfileID,
                            oldProfileImageID: $scope.currentBarberShops[0].image.imageID, newProfileImageID: image.imageID, barberShopID: $scope.currentBarberShops[0].barberShopID
                        },
                            function (data) {
                                if (data && data.response.success) {
                                    $scope.currentBarberShops[0].image.imageID = image.imageID;
                                    $scope.currentBarberShops[0].image.fileName = image.fileName;
                                    $scope.currentBarberShops[0].image.fileLocation = image.fileLocation;
                                    
                                    saveBarberShopProfileImage(image);

                                    toggleIonicLoading($ionicLoading, "Updating profile image succeeded!", true, true, "balanced");
                                } else
                                    toggleIonicLoading($ionicLoading, "Could not update profile image!", true, true, "assertive");

                            }, function error(e) {
                                if (e.status == 500 || e.status == 404) {
                                    toggleIonicLoading($ionicLoading, null, false);
                                }
                            });
                    } else {
                        oldProfileImageID = type == "User" ? $scope.currentProfile.image.imageID : $scope.currentBarber.profile.image.imageID;

                        MbsAPI.updateUserProfileImage({
                            call: "images/update/user/profile/image", values: $scope.mbsProfileID,
                            oldProfileImageID: oldProfileImageID, newProfileImageID: image.imageID, profileID: $scope.mbsProfileID
                        },
                        function (data) {
                            if (data && data.response.success) {
                                if (type == "User") {
                                    $scope.currentProfile.image.imageID = image.imageID;
                                    $scope.currentProfile.image.fileName = image.fileName;
                                    $scope.currentProfile.image.fileLocation = image.fileLocation;
                                } else {
                                    $scope.currentBarber.profile.image.imageID = image.imageID;
                                    $scope.currentBarber.profile.image.fileName = image.fileName;
                                    $scope.currentBarber.profile.image.fileLocation = image.fileLocation;
                                }

                                toggleIonicLoading($ionicLoading, "Updating profile image succeeded!", true, true, "balanced");
                            } else
                                toggleIonicLoading($ionicLoading, "Could not update profile image", true, true, "assertive");

                        }, function error(e) {
                            if (e.status == 500 || e.status == 404) {
                                toggleIonicLoading($ionicLoading, null, false);
                            }
                        });
                    }

                    return true;
                }else
                    if(index == 3)
                    {
                        var image = $scope.imageInfo[$scope.currentImageIndex];
                        var oldProfileImageID, newProfileImageID;

                        oldProfileImageID = $scope.currentBarber.backgroundImage.imageID;

                        MbsAPI.updateUserProfileImage({
                            call: "images/update/user/background/image", values: $scope.mbsProfileID,
                            oldProfileImageID: oldProfileImageID, newProfileImageID: image.imageID, profileID: $scope.mbsProfileID
                        },
                        function (data) {
                            if (data && data.response.success) {
                                $scope.currentBarber.backgroundImage.imageID = image.imageID;
                                $scope.currentBarber.backgroundImage.fileName = image.fileName;
                                $scope.currentBarber.backgroundImage.fileLocation = image.fileLocation;

                                toggleIonicLoading($ionicLoading, "Updating background image succeeded!", true, true, "balanced");
                            } else
                                toggleIonicLoading($ionicLoading, "Could not update background image", true, true, "assertive");

                        }, function error(e) {
                            if (e.status == 500 || e.status == 404) {
                                toggleIonicLoading($ionicLoading, null, false);
                            }
                        });

                        return true;
                    }
            }

            function deleteImageHandler() {
                var image = $scope.imageInfo[$scope.currentImageIndex];

                toggleIonicLoading($ionicLoading, "Deleting image...", true, false, "assertive");

                if (type == "BarberShop") {
                    MbsAPI.deleteBarberShopImage({
                        call: "images/delete/barbershop/image", values: $scope.mbsProfileID,
                        imageID: image.imageID
                    },
                        function (data) {
                            if (data && data.response.success) {
                                delete $scope.imageInfo[$scope.currentImageIndex];

                                var tempImages = [];

                                angular.forEach($scope.imageInfo, function (image, key) {
                                    tempImages.push(image);
                                });

                                $scope.imageInfo = tempImages;
                                tempImages = null;

                                toggleIonicLoading($ionicLoading, "Deleting image succeeded!", true, true, "balanced");

                                handleImageDeletion();

                                $scope.splitImages();
                            }else
                                toggleIonicLoading($ionicLoading, "Could not delete image!", true, true, "assertive");

                        }, function error(e) {
                            if (e.status == 500 || e.status == 404) {
                                toggleIonicLoading($ionicLoading, null, false);
                            }
                        });
                } else {
                    MbsAPI.deleteUserImage({
                        call: "images/delete/user/image", values: $scope.mbsProfileID,
                        imageID: image.imageID
                    },
                    function (data) {
                        if (data && data.response.success) {
                            delete $scope.imageInfo[$scope.currentImageIndex];

                            var tempImages = [];

                            angular.forEach($scope.imageInfo, function (image, key) {
                                tempImages.push(image);
                            });

                            $scope.imageInfo = tempImages;
                            tempImages = null;

                            toggleIonicLoading($ionicLoading, "Deleting image succeeded!", true, true, "balanced");

                            handleImageDeletion();

                            $scope.splitImages();
                        } else
                            toggleIonicLoading($ionicLoading, "Could not delete image!", true, true, "assertive");

                    }, function error(e) {
                        if (e.status == 500 || e.status == 404) {
                            toggleIonicLoading($ionicLoading, null, false);
                        }
                    });
                }

                return true;
            }

            function handleImageDeletion()
            {
                if ($scope.currentImageIndex >= $scope.imageInfo.length - 1)
                    $scope.currentImageIndex -= 1;
                else
                    if ($scope.imageInfo.length == 0)
                        $scope.currentImageIndex = 0;
                    else
                        if ($scope.currentImageIndex == 0)
                            $scope.currentImageIndex = 0;
                        else
                            $scope.currentImageIndex--;

                if ($scope.imageInfo.length == 0)
                    $scope.handleExitClick();
                else {
                    //$scope.changeImage($scope.currentImageIndex);
                    //$ionicSlideBoxDelegate.next();//slide($scope.currentImageIndex);
                    $scope.handleExitClick();
                }
            }
            
            function win(data) {
                toggleIonicLoading($ionicLoading, "Image uploaded successfully!", true, false, "balanced");

                if(data.response)
                {
                    data = JSON.parse(data.response);

                    if(data.response.success && data.response.message == "Image Creation Succeeded!")
                    {
                        var image = {
                            imageID: data.media.imageID,
                            fileLocation: data.media.fileLocation,
                            fileName: data.media.fileName,
                            caption: data.media.caption,
                            imageType: data.media.imageType,
                            mediaGallery: data.media.mediaGallery,
                            imageSrc: IMAGE_ENDPOINT + data.media.fileLocation + data.media.fileName,
                            dateCreated: data.media.dateCreated
                        };

                        if (type == "User") {
                            if (!$scope.currentProfile.images)
                                $scope.currentProfile.images = [];

                            $scope.currentProfile.images.push(image);
                        }
                        else
                            if (type == "Barber") {
                                if (!$scope.currentBarber.barberImages)
                                    $scope.currentBarber.barberImages = [];

                                $scope.currentBarber.barberImages.push(image);
                            }
                            else
                                if (type == "BarberShop") {
                                    if (!$scope.currentBarberShops[0].imgaes)
                                        $scope.currentBarberShops[0].images = [];

                                    $scope.currentBarberShops[0].images.push(image);
                                }

                        if (!$scope.imageInfo)
                            $scope.imageInfo = [];

                        $scope.imageInfo.push(image);

                        $scope.splitImages();

                        $("#imageContainer").css("display", "block");
                        $("#noImageContainer").css("display", "none");

                        toggleIonicLoading($ionicLoading, null);
                        $scope.cancelImageUpload();
                    }
                }else
                    toggleIonicLoading($ionicLoading, null);
            }

            function fail(error) {
                toggleIonicLoading($ionicLoading, "Image upload failed", true, true, 'assertive');
            }

            $scope.uploadImage = function () {
                if (type == "Barber") {
                    var confirmPopup = $cordovaDialogs.confirm("Do you want to add this image to your barber shops gallery?",
                        "Barber Shop Gallery",
                        ["Yes", "No"]).then(function (res) {
                        if (res == 1) 
                            addToShop = true;
                        else 
                            addToShop = false;

                        doUpload();
                    });
                } else
                    doUpload();
            }

            function doUpload()
            {
                var uploadButton = $("#uploadButton").ladda();

                var uri = encodeURI(SITE_ENDPOINT + "my.barber.shop.api/file/upload/image");// + "j.ant.wallace@gmail.com" /*$scope.mbsUsername*/ + "/" + "4" /*$scope.mbsProfileID*/);
                var params = {};

                if (type == "BarberShop") {
                    params.username = $scope.mbsUsername;
                    params.userid = $scope.mbsProfileID;
                    params.barberShopID = $scope.currentBarberShops[0].barberShopID;
                    params.album = $scope.currentBarberShops[0].image.mediaGallery.galleryName;
                    params.galleryID = $scope.currentBarberShops[0].image.mediaGallery.galleryID;
                    params.imageType = "image_type_album";
                    params.mediaFor = "BarberShop";
                } else
                    if (type == "Barber" || type == "User") {
                        params.username = $scope.mbsUsername;//'j.ant.wallace@gmail.com';
                        params.userid = $scope.mbsProfileID;//'4';
                        params.album = $scope.mbsGalleryName;//'j.ant.wallace_1398892209382';
                        params.galleryID = $scope.mbsGalleryID; //'4';
                        params.imageType = "image_type_album";
                        params.mediaFor = "User";

                        if(addToShop)
                        {
                            params.barberShopID = $scope.currentBarber.barberShopID;
                            params.shopGalleryID = $scope.currentBarber.barberShop.image.mediaGallery.galleryID;
                            params.shopGalleryName = $scope.currentBarber.barberShop.image.mediaGallery.galleryName;
                            params.addToShop = true;
                        }
                    }

                params.Connection = "close";
                params.caption = $scope.imageCaption != null || $scope.imageCaption != undefined ? $scope.imageCaption : $("#captionText").val();

                //toggleIonicLoading($ionicLoading, "Uploading image...", true, false, "assertive");
                uploadButton.ladda("start");

                window.resolveLocalFileSystemURL($scope.selectedImage, function (fileEntry) {
                    fileEntry.file(function (fileObj) {
                        var fileName = fileEntry.name;
                        var options = new FileUploadOptions();
                        options.chunkedMode = false;
                        options.headers = params;
                        options.mimeType = "image/jpeg";
                        options.fileKey = "file";
                        options.fileName = "mobile_" + new Date().getTime() + '_' + fileEntry.nativeURL.substr(fileEntry.nativeURL.lastIndexOf('/') + 1);
                        options.params = params;

                        function onprogress(progressEvent) {
                            if (progressEvent.lengthComputable) {
                                if(!ionic.Platform.isIOS())
                                    loadingStatus.setPercentage(progressEvent.loaded / progressEvent.total);

                                uploadButton.ladda("setProgress", (progressEvent.loaded / progressEvent.total));
                            } else {
                                if (!ionic.Platform.isIOS())
                                    loadingStatus.increment();
                            }
                        };

                        $cordovaFileTransfer.upload(uri, fileEntry.nativeURL, options)
                                            .then(win, fail, onprogress);
                    })
                });
            }

            $scope.getUser();

            $scope.handleNotificationsClick = function () {
                //getUserNotifications($scope, $ionicPopup);
                $state.go('notifications');
            }
            $scope.handleNotificationClicked = function (notification) {
                if (notification.title == "New Barber Shop Image") {
                    $state.go('gallery', { userID: notification.barberShopID, type: 'BarberShop' });
                } else
                    if (notification.title == "New Customer") {
                        $state.go('userprofile', { profileID: notification.profileID });
                    }
            }
            $rootScope.$on("HasNotifications", function () {
                $scope.hasNotifications = true;
            });

            $scope.splitImages = function () {
                if ($scope.imageInfo.length > 2) {
                    $scope.firstImages = $scope.imageInfo.slice(0, ($scope.imageInfo.length / 2) + 1);
                    $scope.secondImages = $scope.imageInfo.slice($scope.firstImages.length, $scope.imageInfo.length + 1);
                }else
                    if ($scope.imageInfo.length == 2) {
                        $scope.firstImages = $scope.imageInfo.slice(0, $scope.imageInfo.length / 2);
                        $scope.secondImages = $scope.imageInfo.slice($scope.firstImages.length, $scope.imageInfo.length + 1);
                    } else
                        {
                            $scope.firstImages = $scope.imageInfo;
                        }

                playEffect();
            }

            function playEffect()
            {
                setTimeout(function () {
                    ionic.material.motion.blinds({
                        startVelocity: 3000
                    });
                }, 700);
            }
        }])
        .controller('notificationsController', ['$scope', 'MbsAPI', '$stateParams', '$location', '$ionicLoading', function ($scope, MbsAPI, $stateParams, $location, $ionicLoading) {
            
            $scope.getUser = function () {

                //showLoadingBar("Loading Profile...");
                toggleIonicLoading($ionicLoading, "Loading notifications...", true, false, "assertive");

                $scope.profileInfo = MbsAPI.getUserProfile({
                    call: "profile/gather/details", profileID: $scope.mbsProfileID
                },
                function (data) {
                    if (data && data.response.success) {
                        buildProfile(data, $scope);
                    } else {
                        //error getting user data
                    }

                    toggleIonicLoading($ionicLoading, null, false);
                }, function error(e) {
                    if (e.status == 500 || e.status == 404) {
                        toggleIonicLoading($ionicLoading, null, false);
                    }
                });
            };

            getUserData($scope);

            //$scope.getUser();

            getUserNotifications($scope);
            
            setTimeout(function () {
                ionic.material.motion.blinds();
            }, 500);

            $scope.handleNotificationClicked = function (notification) {
                if (notification.title == "New Barber Shop Image") {
                    $state.go('gallery', { userID: notification.barberShopID, type: 'BarberShop' });
                } else
                    if (notification.title == "New Customer") {
                        $state.go('userprofile', { profileID: notification.profileID });
                    }
            }
        }])
	   .controller('squarePaymentController', ['$scope', 'MbsAPI', '$stateParams', '$location', '$ionicLoading', '$state', '$rootScope', function ($scope, MbsAPI, $stateParams, $location, $ionicLoading, $state, $rootScope) {
	       
	       var searchObject = $location.search();
	       var profileID = $stateParams.profileID, userInfo = {};

	       var db = window.openDatabase("mybarbershop", "1.0", "MyBarberShop", 1000000);

	       if (db != null)
	           db.transaction(initializeSquareDB, errorCB, successCB);

	       $scope.userImage;
	       $scope.isAvailable;
	       $scope.isAppointments;
	       $scope.isAppointment;
	       $scope.isVacationing;
	       $scope.vacationPeriod;
	       $scope.memberSince;
	       $scope.screenHeight = (screen.height - (hasAds ? 50 : 0)) + "px";

	       $scope.getUser = function () {

	           //showLoadingBar("Loading Profile...");
	           toggleIonicLoading($ionicLoading, "Loading profile...", true, false, "assertive");

	           $scope.profileInfo = MbsAPI.getUserProfile({
	               call: "profile/gather/details", profileID: profileID
	           },
                   function (data) {
                       if (data && data.response.success) {
                           buildProfile(data, $scope);
                           buildBarberShop(data.barberShop, $scope);

                           var dateCreated = splitDate($scope.currentProfile.dateCreated);

                           $scope.userImage = getProfileImage($scope.currentProfile.image, "profile", "avatar");
                           $scope.memberSince = getReadableMonth(dateCreated.getMonth()) + " " + dateCreated.getDate() + ", " +
        	               						 dateCreated.getFullYear();
                           /*var gallery = renderGallery($scope.currentProfile.images, "#userGallery");
                           
                           if(gallery != null)
                        	   $("#userGallery").append(gallery);*/

                           handleImages($scope.currentProfile.images);

                           /*$("#userShops").append(renderUserShops($scope));*/
                       } else {
                           //error getting user data
                       }

                       //showNavigation("search");

                       //removeLoadingBar();
                       toggleIonicLoading($ionicLoading, null, false);
                   }, function error(e) {
                       if (e.status == 500 || e.status == 404) {
                           toggleIonicLoading($ionicLoading, null, false);
                       }
                   });
	       };
	       $scope.registerSquare = function (shouldRegister) {
	           if (shouldRegister) {
	               //var deferred = $q.defer();
	               var ref = window.open("https://connect.squareup.com/oauth2/authorize?client_id=YaEo-68c_CYTLpP-Vd1Inw&redirect_uri=http://localhost/callback&response_type=token&scope=MERCHANT_PROFILE_READ&session=true",
                                         "_blank", "location=no");
	               var paramMap = [];

	               //application_secret=-WnH_B4UMws3QGe5lLtJLR1Aaku158wh4nkYDfNHz0c&
	               ref.addEventListener("loadstart", function (event) {
	                   if (event) {
	                       if ((event.url).indexOf("http://localhost/callback") === 0) {
	                           var callbackResponse = (event.url).split("#")[1];
	                           var responseParams = (callbackResponse).split("&");

	                           for (var i = 0; i < responseParams.length; i++) {
	                               paramMap[responseParams[i].split("=")[0]] = responseParams[i].split("=")[1];
	                           }

	                           if (paramMap.access_token !== undefined && paramMap.access_token !== null) {
	                               //deferred.resolve({ access_token: paramMap.access_token });
	                           }

	                           setTimeout(function () {
	                               ref.close();
	                           }, 10);
	                       }
	                   }
	               });
	               ref.addEventListener("exit", function (event) {
	                   if (event) {
	                       if (paramMap && paramMap.access_token) {
	                           globalScope.squareAccessToken = paramMap.access_token;
	                           globalScope.squareMerchantID = paramMap.merchant_id;
	                           globalScope.squareExpiration = paramMap.expires_at;

	                           db.transaction(saveSquareData, errorCB, successCB);
	                       }
	                   }
	               });

	               //return deferred.promise;
	           }
	       };
	       $scope.payWithSquare = function () {
	           var amount = $("#paymentAmount").val();
	           var hasError = false;

	           if (amount.indexOf(".") > -1) {
	               try
	               {
	                   amount = parseFloat(amount) * 100;
	               }catch(err)
	               {
	                   hasError = true;
	               }
	           }else
	           {
	               try
	               {
	                   amount = parseInt(amount) * 100;
	               }catch(err)
	               {
	                   hasError = true;
	               }
	           }

	           if (!hasError) {
	               var paymentInfo = {
	                   amount_money: {
	                       amount: amount,
	                       currency_code: "USD"
	                   },
	                   callback_url: "mybarbershop://square_payment_complete",
	                   client_id: "YaEo-68c_CYTLpP-Vd1Inw",
	                   merchant_id: globalScope.squareMerchantID,
	                   options: {
	                       supported_tender_types: [
                               "CREDIT_CARD"
	                       ]
	                   }
	               }

	               window.location = "square-commerce-v1://payment/create?data=" + encodeURIComponent(JSON.stringify(paymentInfo));
	           } else {
	               hasError = false;
	               alert("Invalid dollar amount");
	           }
	       };
	       $scope.handleSquarePayment = function(result)
	       {
	           if(result)
	           {
	               if(result.status === "ok")
	                   alert("Payment was successful! Payment ID is " + result.payment_id);
	               else
	                   if(result.status === "error")
	                   {
	                       switch(result.error_code)
	                       {
	                           case "could_not_perform":
	                               alert("Make sure you have no other payments initiated before attempting to request a payment; or Square Register app is installed");
	                               break;
	                           case "no_network_connection":
	                               alert("Please make sure you have an internet connection before attempting to make a payment");
	                               break;
	                           case "amount_too_large":
	                               alert("The amount specified is too large. Please recheck the payment amount and try again.");
	                               break;
	                           case "amount_too_small":
	                               alert("The amount specified is too small. Please recheck the payment amount and try again.");
	                               break;
	                           case "user_not_activated":
	                               alert("Please make sure your Square account is activated before attempting to make a payment.");
	                               break;
	                           case "merchant_id_mismatch":
	                               alert("Please make sure you are current logged into Square is the same account you authorized this application with before making a payment.");
	                               break;
	                           case "not_logged_in":
	                               alert("Please make sure you are logged into Square application before attempting to make a payment.");
	                               break;
	                           case "payment_cancelled":
	                               alert("You cancelled the payment.");
	                               break;
	                           case "unknown":
	                               alert("There was an error processing the request with Square.");
	                               break;
	                       }
	                   }
	           }
	       }

	       getUserData($scope);

	       globalScope = $scope;

	       if (db) {
	           db.transaction(checkSquare, errorCB);
	       }else
	            $scope.registerSquare(true);

	       //$scope.getUser();
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