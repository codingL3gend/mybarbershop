var places = 'AIzaSyBRn4K1hSAsfob8cB064EQLpvk4M4l8x1Q';
var dataObjects;
var map;
var SITE_ENDPOINT = "http://107.146.188.140:8080/";
var IMAGE_ENDPOINT = "http://107.146.188.140:8080/";
var globalScope, navStack = [];

//$(function(){
//    $('.slimScrollIt').slimScroll({
//        height: '100%'
//    });
    
//    /*document.addEventListener("backbutton", function(){
//    	getNavigationStack().pop();
//    }, false);*/
    

//    //navigator.geolocation.getCurrentPosition(onSuccess, onError);
////    navigator.camera.getPicture( onSuccess, onFail, { quality: 50,
////        destinationType: Camera.DestinationType.DATA_URL
////    });
    
    
//});

function onSuccess(imageData) {
    var image = document.getElementById('myImage');
    image.src = "data:image/jpeg;base64," + imageData;
}

function onFail(message) {
    alert('Failed because: ' + message);
}

var onSuccess = function(position) {
    /*alert('Latitude: '          + position.coords.latitude          + '\n' +
          'Longitude: '         + position.coords.longitude         + '\n' +
          'Altitude: '          + position.coords.altitude          + '\n' +
          'Accuracy: '          + position.coords.accuracy          + '\n' +
          'Altitude Accuracy: ' + position.coords.altitudeAccuracy  + '\n' +
          'Heading: '           + position.coords.heading           + '\n' +
          'Speed: '             + position.coords.speed             + '\n' +
          'Timestamp: '         + position.timestamp                + '\n');*/
};

// onError Callback receives a PositionError object
//
function onError(error) {
    navigator.notification.alert('code: '    + error.code    + '\n' +
          'message: ' + error.message + '\n');
}

function validateEmail(email)
{
    if (!(typeof email == "undefined" && email.length > 0 && !(email === ""))) {
        var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

        return re.test(email);
    }
}

function validateInput(validate)
{
    if (!(typeof validate === "undefined") && validate.length > 0 && !(validate === ""))
        return true;

    return false;
}

function initializeStorage(ready, error)
{
    //if (Modernizr.indexeddb) {
    //    var db = indexedDB.open("mbs");

    //    db.onupgradeneeded = function () {
    //        var data = db.result;
    //        var store = data.createObjectStore("profile", { keyPath: "id" });
    //        store.createIndex("userid", "id", { unique: true });

    //        store.put({ id: 4 });
    //    };

    //    db.onsuccess = function () {
    //        data = db.result;
    //    };
    //} else
    //    if (Modernizr.websqldatabase) {
    //        return openDatabase('profile', '1.0', 'Profile storage', 5 * 1024 * 1024, function (db) {
    //            db.changeVersion('', '1.0', function (t) {
    //                t.executeSql('CREATE TABLE user (id, userid');
    //            }, error);
    //        });
    //    }
}

function initializeDB(tran)
{
    tran.executeSql('CREATE TABLE IF NOT EXISTS Profile (id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, username VARCHAR(50), password VARCHAR(20))');
}

function initializeSquareDB(tran) {
    tran.executeSql('CREATE TABLE IF NOT EXISTS Square (id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, accessToken VARCHAR(100), merchantID VARCHAR(100), expiration DATETIME2)');
}

function clearDB(tran) {
    tran.executeSql('DELETE FROM Profile');
    tran.executeSql('DELETE FROM Square');
}

function errorCB(err) {
    console.log(err);
    //alert("Error processing SQL: " + err.code);
}

function successCB() {
    console.log('success calling db');
}

//function checkUser()
//{
//    var userid = 0;

//    if(Modernizr.indexeddb)
//    {
//        var request = indexedDB.open("mbs");

//        request.onsuccess = function()
//        {
//            var tx = request.result.transaction("profile", "readonly");
//            var store = tx.objectStore("profile");

//            store.openCursor().onsuccess = function (event) {
//                var cursor = event.target.result;

//                if(cursor)
//                {
//                    userid = cursor.value.id;
//                    cursor.continue();
//                }
//            };

//            /*cursor.listen();

//            var data = index.get("");

//            data.onsuccess = function () {
//                var matching = data.result;
//                if(matching !== undefined)
//                {

//                }
//            }*/
//        }
//    }else
//        if(Modernizr.websqldatabase)
//        {

//        }

//    return userid;
//}

function checkUser(tran) {
    tran.executeSql("SELECT id, username, password FROM Profile", [], userQuerySuccess, errorCB)
}

function checkSquare(tran) {
    tran.executeSql("SELECT id, accessToken, merchantID, expiration FROM Square", [], squareQuerySuccess, errorCB)
}

function userQuerySuccess(tran, results)
{
    if (results) {

        //if (splashScreen)
            //splashSceen.hide();

        var user = {};

        var size = results.rows.length;

        for (var i = 0; i < size; i++) {
            user.id = results.rows.item(i).id;
            user.username = results.rows.item(i).username;
            user.password = results.rows.item(i).password;
        }

        //globalScope.savedUser = user;

        if(user.username)
        {
            globalScope.logUsername = user.username;
            globalScope.logPassword = user.password;

            globalScope.authUser(false);
        }
    }

    globalScope.savedUser = null;
}

function squareQuerySuccess(tran, results) {
    if (results) {

        var user = {};

        var size = results.rows.length;

        for (var i = 0; i < size; i++) {
            user.id = results.rows.item(i).id;
            user.accessToken = results.rows.item(i).accessToken;
            user.merchantID = results.rows.item(i).merchantID;
            user.expiration = results.rows.item(i).expiration;
        }

        if (user.accessToken) {
            globalScope.squareAccessToken = user.accessToken;
            globalScope.squareMerchantID = user.merchantID;
            globalScope.squareExpiration = user.expiration;

            globalScope.registerSquare(false);
        } else
            globalScope.registerSquare(true);
    }

    //globalScope.registerSquare(true);
}

//function saveUserData($scope) {
//    var userid = 0;

//    if (Modernizr.indexeddb) {
//        var db = indexedDB.open("mbs");
        
//        var data = db.result.transaction("profile", "readwrite");
//        var store = data.objectStore("profile");

//        store.put({ id: $scope.mbsProfileID });

//        return true;
//    } else
//        if (Modernizr.websqldatabase) {

//        }

//    return false;
//}

function saveUserData(tran) {
    console.log('saving user data');
    var $scope = globalScope;

    tran.executeSql("INSERT INTO Profile (username, password) VALUES ('" + $scope.logUsername + "','" + $scope.logPassword + "')");

    return false;
}

function saveSquareData(tran) {
    var $scope = globalScope;

    tran.executeSql("INSERT INTO Square (accessToken, merchantID, expiration) VALUES ('" + $scope.squareAccessToken + "','" + $scope.squareMerchantID + "','" +
                    $scope.squareExpiration + "')");

    return false;
}

function setUserData($scope) {
    localStorage["mbsUsername"] = $scope.mbsUsername;
    localStorage["mbsDisplayName"] = $scope.mbsDisplayName;
    localStorage["mbsID"] = $scope.mbsID;
    localStorage["mbsProfileID"] = $scope.mbsProfileID;
    localStorage["mbsDateCreated"] = $scope.mbsDateCreated;
    localStorage["mbsPrivacy"] = $scope.mbsPrivacy;
    localStorage["mbsProfileStatus"] = $scope.mbsProfileStatus;
    //localStorage["mbsProfileType"] = $scope.mbsProfileType;
    localStorage["mbsAccountType"] = $scope.mbsAccountType;
    localStorage["mbsGalleryID"] = $scope.mbsGalleryID;
    localStorage["mbsGalleryName"] = $scope.mbsGalleryName;
    localStorage["mbsProfileImage"] = $scope.mbsProfileImage;

    if(isBarber($scope.mbsAccountType))
        localStorage["mbsBarberID"] = $scope.mbsBarberID;
    //localStorage["newUser"] = (($scope.newUser == null) ? false : $scope.newUser);
}

function setBarberData(barberInfo) {
    localStorage["barberInfo"] = JSON.stringify(barberInfo);
}

function setImageData(imageInfo) {
    localStorage["imageInfo"] = JSON.stringify(imageInfo);
}

function setNavigationStack(stack)
{
	localStorage["navigationStack"] = JSON.stringify(stack);
}

function setBackPage(page)
{
	var stack = getNavigationStack();
	
	stack.push(page);
	
	setNavigationStack(stack);
}

function setUserShop($scope)
{
    localStorage["userShop"] = $scope.userShop;
}



function getUserShop($scope) {
    $scope.userShop = localStorage["userShop"];
}

function logOut() {
    if (window.AdMob && hasAds)
        window.AdMob.removeBanner();

    clearUserData();
}

function loadProfile(){	
	if(globalScope)
	{
		if(getAccountType(globalScope.mbsAccountType) == "Barber")
			{
				getPageView("index.html", "barberprofile.html", "barberID=" + globalScope.currentBarber.barberID, false);
			//$("#profileLink").prop("href", document.URL.replace("index.html", "index.html#/barberprofile/" + globalScope.currentBarber.barberID));
			//window.location = p;//document.URL.replace("index.html", "index.html#/barberprofile/" + globalScope.currentBarber.barberID);
			}
		else
			getPageView("index.html", "profile.html", "profileID=" + globalScope.mbsProfileID, false);
	}
}

function clearUserData($state) {
    //getPageView("index.html", "auth/login.html", null, false);
    
    localStorage.clear();

    var db = window.openDatabase("mybarbershop", "1.0", "MyBarberShop", 1000000);

    if (db != null)
        db.transaction(clearDB, errorCB, successCB);

    $state.go('login');
}

function getUserData($scope) {
    $scope.mbsUsername = localStorage["mbsUsername"];
    $scope.mbsDisplayName = localStorage["mbsDisplayName"];
    $scope.mbsID = localStorage["mbsID"];
    $scope.mbsProfileID = localStorage["mbsProfileID"];
    $scope.mbsDateCreated = localStorage["mbsDateCreated"];
    $scope.mbsPrivacy = localStorage["mbsPrivacy"];
    $scope.mbsProfileStatus = localStorage["mbsProfileStatus"];
    //$scope.mbsProfileType = localStorage["mbsProfileType"];
    $scope.mbsAccountType = localStorage["mbsAccountType"];
    $scope.mbsGalleryID = localStorage["mbsGalleryID"];
    $scope.mbsGalleryName = localStorage["mbsGalleryName"];
    $scope.mbsProfileImage = localStorage["mbsProfileImage"];
    //$scope.newUser = (localStorage["newUser"] == "true");

    if(isBarber($scope.mbsAccountType))
        $scope.mbsBarberID = localStorage["mbsBarberID"];

    var iconPrefix = "icon ";

    if(ionic.Platform.isIOS())
    {
        $scope.menuIcon = iconPrefix + "ion-navicon";
        $scope.searchIcon = iconPrefix + "ion-ios-search";
        $scope.notificationsIcon = iconPrefix + "ion-ios-email";
        $scope.profileIcon = iconPrefix + "ion-ios-person";
        $scope.galleryIcon = iconPrefix + "ion-ios-film";
        $scope.logOutIcon = iconPrefix + "ion-log-out";
        $scope.homeIcon = iconPrefix + "ion-ios-home";
        $scope.backIcon = iconPrefix + "ion-ios-arrow-back";
        $scope.barberIcon = iconPrefix + "ion-ios-personadd";
        $scope.appointmentIcon = iconPrefix + "ion-ios-calendar";
        $scope.imageUploadIcon = iconPrefix + "ion-ios-upload-outline";
        $scope.closeOutlineIcon = iconPrefix + "ion-ios-close-outline";
        $scope.closeIcon = iconPrefix + "ion-ios-close";
        $scope.settingsIcon = iconPrefix + "ion-ios-gear";
        $scope.checkmarkIcon = iconPrefix + "ion-ios-checkmark-empty";
        $scope.starOutlineIcon = iconPrefix + "ion-ios-star-outline";
        $scope.starIcon = iconPrefix + "ion-ios-star";
    }else
        if(ionic.Platform.isAndroid())
        {
            $scope.menuIcon = iconPrefix + "ion-android-menu";
            $scope.searchIcon = iconPrefix + "ion-android-search";
            $scope.notificationsIcon = iconPrefix + "ion-android-mail";
            $scope.profileIcon = iconPrefix + "ion-android-person";
            $scope.galleryIcon = iconPrefix + "ion-android-film";
            $scope.logOutIcon = iconPrefix + "ion-android-exit";
            $scope.homeIcon = iconPrefix + "ion-android-home";
            $scope.backIcon = iconPrefix + "ion-android-arrow-back";
            $scope.barberIcon = iconPrefix + "ion-android-person-add";
            $scope.appointmentIcon = iconPrefix + "ion-android-calendar";
            $scope.imageUploadIcon = iconPrefix + "ion-android-upload";
            $scope.closeOutlineIcon = iconPrefix + "ion-android-close";
            $scope.closeIcon = iconPrefix + "ion-android-cancel";
            $scope.settingsIcon = iconPrefix + "ion-android-settings";
            $scope.checkmarkIcon = iconPrefix + "ion-android-done";
            $scope.starOutlineIcon = iconPrefix + "ion-android-star-outline";
            $scope.starIcon = iconPrefix + "ion-android-star";
        }else
        {
            $scope.menuIcon = iconPrefix + "ion-navicon";
            $scope.searchIcon = iconPrefix + "ion-search";
            $scope.notificationsIcon = iconPrefix + "ion-email-unread";
            $scope.profileIcon = iconPrefix + "ion-person";
            $scope.galleryIcon = iconPrefix + "ion-images";
            $scope.logOutIcon = iconPrefix + "ion-log-out";
            $scope.homeIcon = iconPrefix + "ion-ios-home";
            $scope.backIcon = iconPrefix + "ion-chevron-left";
            $scope.barberIcon = iconPrefix + "ion-person-add";
            $scope.appointmentIcon = iconPrefix + "ion-calendar";
            $scope.imageUploadIcon = iconPrefix + "ion-upload";
            $scope.closeOutlineIcon = iconPrefix + "ion-close";
            $scope.closeIcon = iconPrefix + "ion-close-circled";
            $scope.settingsIcon = iconPrefix + "ion-gear-b";
            $scope.checkmarkIcon = iconPrefix + "ion-checkmark";
            $scope.starOutlineIcon = iconPrefix + "ion-ios-checkmark-empty";
            $scope.starIcon = iconPrefix + "ion-ios-checkmark-empty";
        }
}

function getBarberData($scope) {
	if(localStorage["barberInfo"])
		$scope.barberInfo = JSON.parse(localStorage["barberInfo"]);
}

function getImageData($scope) {
    if (localStorage["imageInfo"])
        $scope.imageInfo = JSON.parse(localStorage["imageInfo"]);
}

function getNavigationStack() {
	
	if(localStorage["navigationStack"])
		navStack = JSON.parse(localStorage["navigationStack"]);
    
    return navStack != null || navStack != undefined ? navStack : [];
}

function getBackPage(){
	
	var stack = getNavigationStack();
	
	var page = stack.pop();
	
	setNavigationStack(stack);
	
	return page;
}

function getAccountType(type)
{
	if(type)
	{
		switch(type)
		{
			case "account_type_customer":
				return "Customer";
			case "account_type_barber":
				return "Barber";
			default:
				return "Customer"
		}
	}
	
	return "Customer";
}

function isBarber(type)
{
	if(type)
	{
		switch(type)
		{
			case "account_type_customer":
				return false;
			case "account_type_barber":
				return true;
			default:
				return false;
		}
	}
	
	return false;
}

function renderNearbyBarberShops(data, $scope, $filter, coords) {
    if (data) {
        dataObjects = new Array();
        
        var shops = data;
        
        var barberShopID = []; 
        
        if(isBarber($scope.mbsAccountType))
        	barberShopID.push($scope.currentBarber.barberShopID);
        else
    	{
        	angular.forEach($scope.currentBarberShops, function(shop, key){
        		barberShopID.push(shop.barberShopID);
        	});
    	}
        
        if (shops && shops.length > 0)
            shops = $filter('filter')(shops, { barberShopID: barberShopID }, function (actual, expected) {
                return barberShopID.indexOf(actual) > -1 ? false : true;
            });

        var container = $("<div/>").addClass("list card ");

        angular.forEach(shops, function (barberShop, key) {
            var shop = $("<div/>").addClass("item item-body")/*.css("background-color", "#4b4d4e")*/;

            var shopName = $("<label/>").text(barberShop.shopName);
            var shopAddress = $("<label/>").text(barberShop.street);
            var shopCityState = $("<label/>").text(barberShop.city + ", " + barberShop.state);
            var defaultButton = $("<button/>").addClass("button button-icon button-clear icon-left ion-images")/*.append(
            						$("<i/>").addClass("")
            								 .text()
        						)*/.text("Set as your shop").attr("value", barberShop.shopName).click(function () {          	
                if (dataObjects) 
                {                    
                    var selectedShop = {};
                    var button = $(this);
                    angular.forEach(dataObjects, function (shop, key) {
                        if (shop.shopName == button.attr("value")) {                        	
                        	selectedShop = shop;                        	
                        }
                        
                    });      
                    
	            	if(isBarber($scope.mbsAccountType))
	        		{
						$scope.currentBarber.barberShopID = selectedShop.barberShopID;
	            		
						var confirmPopup = $scope.$cordovaDialogs.confirm("Do you own this shop?", 
	            			"Barber Shop Select",
	            			["Yes", "No"]).then(function(res) 
        				{
	            		     if(res == 1) 
	            		     {
	            		    	$scope.currentBarber.isOwner = true;
            					$scope.updateBarberInfo();
	            		     } else 
	            		     {
	            		    	$scope.currentBarber.isOwner = false;
            					$scope.updateBarberInfo();
	            		     }
	            		});            		        		
	        		}else  
                        $scope.createBarberShopCustomer(selectedShop);
                }
            });

            var distance = $("<label/>").text("Distance: " + calculateDistance(coords.lat, coords.lon, barberShop.latitude, barberShop.longitude, "M") +
                            " miles away");

            shop.append(shopName)
                .append($("<br/>"))
                .append(shopAddress)
                .append($("<br/>"))
                .append(shopCityState)
                //.append($("<i/>").addClass("fa fa-chevron-right pull-right").val("::before").css("color", "white"))
                .append($("<br/>"))
                .append(distance)
                .append($("<br/>"));
               // .append();


            container.append(shop);
            container.append($("<div/>").addClass("item").append(defaultButton));
        $("#conDiv").append(container);

            dataObjects.push(barberShop);
        });

    }
}

function renderBarberShops(data, $scope, coords)
{
    if(data)
    {
    	if(dataObjects == null)
    		dataObjects = new Array();

        var container = $("<div/>").addClass("list card ");

        angular.forEach(data, function (barberShop, key) {
            var shop = $("<div/>").addClass("item item-body")/*.css("background-color", "#4b4d4e")*/;

            var shopName = $("<label/>").text(barberShop.name);
            var shopAddress = $("<label/>").text(formatAddress(barberShop.formatted_address, "Street"));
            var shopCityState = $("<label/>").text(formatAddress(barberShop.formatted_address, "CityState"));
            var defaultButton = $("<button/>").addClass("button button-icon button-clear icon-left ion-images")/*.append(
            						$("<i/>").addClass("")
            								 .text()
        						)*/.text("Set as your shop").attr("value", barberShop.name).click(function () {
                if(dataObjects)
                {
                    var button = $(this);

                    angular.forEach(dataObjects, function (shop, key) {
                        if(shop.name == button.attr("value"))
                        {
                            //check for more details on the shop
                            var request = {
                                reference: shop.reference
                            };

                            var service = new google.maps.places.PlacesService(map);
                            service.getDetails(request, function (results, status) {
                                if (status == google.maps.places.PlacesServiceStatus.OK) {
                                    //update the shop information
                                    shop.phoneNumber = results.formatted_phone_number;
                                    if(results.website)
                                        shop.website = results.website;
                                    if (results.opening_hours) {
                                        for (var i = 0; i < results.opening_hours.periods.length; i++) {
                                            var hours = results.opening_hours.periods[i];
                                            var allDay = false;

                                            if(!hours.close)
                                                allDay = true;

                                            switch (i) {
                                                case 0:
                                                    shop.sunday = allDay == true ? "Open All Day" :
                                                    getReadableGoogleHours(hours.open) + " - " + getReadableGoogleHours(hours.close);
                                                    break;
                                                case 1:
                                                    shop.monday = allDay == true ? "Open All Day" :
                                                    getReadableGoogleHours(hours.open) + " - " + getReadableGoogleHours(hours.close);
                                                    break;
                                                case 2:
                                                    shop.tuesday = allDay == true ? "Open All Day" :
                                                    getReadableGoogleHours(hours.open) + " - " + getReadableGoogleHours(hours.close);
                                                    break;
                                                case 3:
                                                    shop.wednesday = allDay == true ? "Open All Day" :
                                                    getReadableGoogleHours(hours.open) + " - " + getReadableGoogleHours(hours.close);
                                                    break;
                                                case 4:
                                                    shop.thursday = allDay == true ? "Open All Day" :
                                                    getReadableGoogleHours(hours.open) + " - " + getReadableGoogleHours(hours.close);
                                                    break;
                                                case 5:
                                                    shop.friday = allDay == true ? "Open All Day" :
                                                    getReadableGoogleHours(hours.open) + " - " + getReadableGoogleHours(hours.close);
                                                    break;
                                                case 6:
                                                    shop.saturday = allDay == true ? "Open All Day" :
                                                    getReadableGoogleHours(hours.open) + " - " + getReadableGoogleHours(hours.close);
                                                    break;
                                            }
                                        }
                                    }
                                }

                                if (isBarber($scope.mbsAccountType)) {
                                    shop.isCustomer = false;

                                    var confirmPopup = $scope.$cordovaDialogs.confirm("Do you own this shop?",
                                        "Barber Shop Select",
                                        ["Yes", "No"]).then(function (res) {
                                        if (res == 1) {
                                            shop.isOwner = true;

                                            $scope.createBarberShop(shop);
                                        }
                                        else {
                                            shop.isOwner = false;

                                            $scope.createBarberShop(shop);
                                        }
                                    });
                                } else
                                {
                                    shop.isCustomer = true;
                                    shop.isOwner = false;

                                    $scope.createBarberShop(shop);
                                }
                            });

                        }  
                    });
                }
            });
            var distance = $("<label/>").text("Distance: " + calculateDistance(coords.lat, coords.lon, barberShop.geometry.location.k, barberShop.geometry.location.A != null ? barberShop.geometry.location.A : barberShop.geometry.location.D, "M") +
                            " miles away");

            shop.append(shopName)
                .append($("<br/>"))
                .append(shopAddress)
                .append($("<br/>"))
                .append(shopCityState)
                //.append($("<i/>").addClass("fa fa-chevron-right pull-right").val("::before").css("color", "white"))
                .append($("<br/>"))
                .append(distance)
                .append($("<br/>"))
                .append(defaultButton);
                

           // container.append(shop);
            container.append(shop);
            container.append($("<div/>").addClass("item").append(defaultButton).append(defaultButton));
            $("#conDiv").append(container);

            dataObjects.push(barberShop);
        });

    }
}

function calculateDistance(lat1, lon1, lat2, lon2, unit) {
    var radlat1 = Math.PI * lat1 / 180;
    var radlat2 = Math.PI * lat2 / 180;
    var radlon1 = Math.PI * lon1 / 180;
    var radlon2 = Math.PI * lon2 / 180;
    var theta = lon1 - lon2;
    var radtheta = Math.PI * theta / 180;
    var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
    dist = Math.acos(dist);
    dist = dist * 180 / Math.PI;
    dist = dist * 60 * 1.1515;
    if (unit == "K") { dist = dist * 1.609344 }
    if (unit == "N") { dist = dist * 0.8684 }


    return dist.toFixed(2);
}

function formatAddress(address, type)
{
    var format = address.split(", ");

    if(format)
    {
        switch(type)
        {
            case "NoCountry":
                return format[0] + " " + format[1] + "," + format[2];
            case "CityState":
                return format[1] + "," + format[2];
            case "City":
                return format[1];
            case "State":
                return format[2].substring(0, 2);
            case "Street":
                return format[0];
        }
    }

    return address;
}

function formatAddressReverse(address, type) {
    if (address) {
        switch (type) {
            case "NoCountry":
                return format[0] + " " + format[1] + "," + format[2];
            case "CityState":
                return address.city + "," + address.abbreviatedStateProvince;
            case "City":
                return address.city;
            case "State":
                return address.abbreviatedStateProvince;
            case "Street":
                return address.addressLineOne;
        }
    }

    return address;
}

function buildBarberProfile(barber, $scope)
{
    if(barber)
    {
        $scope.currentBarber = {};
        
        var currentBarber = new Object();

        currentBarber.barberID = barber.barberID;
        currentBarber.avgCutTime = barber.avgCutTime;
        currentBarber.normalTimeIn = barber.normalTimeIn;
        currentBarber.yearsOfExperience = barber.yearsOfExperience;
        currentBarber.barberShopID = barber.barberShopID;
        currentBarber.profileID = barber.profileID;
        currentBarber.acceptsAppointments = barber.acceptsAppointments;
        currentBarber.isOwner = barber.isOwner;
        currentBarber.profile = barber.profile;

        if (barber.profile.image.imageID > 0)
            currentBarber.profile.image.defaultImage = barber.profile.image.fileLocation + barber.profile.image.fileName;

        currentBarber.barberShop = barber.barberShop;
        currentBarber.barberStatus = barber.barberStatus;
        currentBarber.barberStatus.vacationStartDateReadable = barber.barberStatus.vacationStartDate != null ? formatDateNoTime(barber.barberStatus.vacationStartDate) : "N/A";
        currentBarber.barberStatus.vacationEndDateReadable = barber.barberStatus.vacationEndDate != null ? formatDateNoTime(barber.barberStatus.vacationEndDate) : "N/A";
        currentBarber.rating = barber.rating;
        currentBarber.barberSchedule = barber.barberSchedule;
        currentBarber.barberSpecialties = barber.barberSpecialties;
        currentBarber.barberClients = barber.barberClients;
        currentBarber.barberImages = barber.barberImages;
        currentBarber.dateCreated = barber.dateCreated;

        $scope.currentBarber = currentBarber;
    }
}

function buildBarberSearchProfile(barber) {
    if (barber) {
        var currentBarber = new Object();

        currentBarber.barberID = barber.barberID;
        currentBarber.avgCutTime = barber.avgCutTime;
        currentBarber.normalTimeIn = barber.normalTimeIn;
        currentBarber.yearsOfExperience = barber.yearsOfExperience;
        currentBarber.barberShopID = barber.barberShopID;
        currentBarber.profileID = barber.profileID;
        currentBarber.acceptsAppointments = barber.acceptsAppointments;
        currentBarber.doesAppointments = convertBoolean(barber.acceptsAppointments);
        currentBarber.isOwner = barber.isOwner;
        currentBarber.profile = barber.profile;

        if (barber.profile.image.imageID > 0) {
            barber.profile.image.defaultImage = currentBarber.profile.image.defaultImage = barber.profile.image.fileLocation + barber.profile.image.fileName;
        }
        
        currentBarber.barberImage = getProfileImage(barber.profile.image, "barber");

        currentBarber.barberShop = barber.barberShop;
        currentBarber.barberStatus = barber.barberStatus;
        currentBarber.barberStatus.vacationStartDateReadable = barber.barberStatus.vacationStartDate != null ? formatDateNoTime(barber.barberStatus.vacationStartDate) : "N/A";
        currentBarber.barberStatus.vacationEndDateReadable = barber.barberStatus.vacationEndDate != null ? formatDateNoTime(barber.barberStatus.vacationEndDate) : "N/A";
        currentBarber.rating = barber.rating;
        currentBarber.ratingCalc = calculateRating(barber.rating.rating, 100);
        currentBarber.barberSchedule = barber.barberSchedule;
        currentBarber.barberSpecialties = barber.barberSpecialties;
        currentBarber.barberClients = barber.barberClients;
        currentBarber.barberImages = barber.barberImages;
        currentBarber.dateCreated = barber.dateCreated;

        return currentBarber;
    }
}


function buildProfile(profile, $scope)
{
    if(profile)
    {
        $scope.currentProfile = {};

        var currentProfile = new Object();

        currentProfile.profileID = profile.member.profileID;
        currentProfile.displayName = profile.member.displayName;
        currentProfile.profileStatus = profile.member.profileStatus;
        currentProfile.accountType = profile.member.accountType;
        currentProfile.image = profile.member.image;

        if (profile.member.image.imageID > 0)
            currentProfile.image.defaultImage = profile.member.image.fileLocation + profile.member.image.fileName;

        currentProfile.dateCreated = profile.member.dateCreated;
        currentProfile.barberShop = profile.barberShop;
        currentProfile.images = profile.media;
        
        $scope.currentProfile = currentProfile;
    }
}

function buildBarberShop(barberShop, $scope, $sce)
{
    if(barberShop)
    {
        $scope.currentBarberShops = new Array();

        angular.forEach(barberShop, function (shop, key) {
            var currentBarberShop = new Object();

            currentBarberShop.barberShopID = shop.barberShopID;
            currentBarberShop.shopName = shop.shopName;
            currentBarberShop.totalBarbers = shop.totalBarbers;
            currentBarberShop.phoneNumber = shop.phoneNumber;
            currentBarberShop.hoursOfOperation = shop.hoursOfOperation;
            currentBarberShop.image = shop.image;

            if (shop.image.imageID > 0)
                currentBarberShop.image.defaultImage = shop.image.fileLocation + shop.image.fileName;

            currentBarberShop.address = shop.address;
            currentBarberShop.barberShopSpecialties = shop.barberShopSpecialties;
            currentBarberShop.barbers = shop.barbers;
            currentBarberShop.images = shop.images;
            currentBarberShop.customers = shop.customers;

            currentBarberShop.shopImage = getProfileImage(shop.image, "barberShop");
            currentBarberShop.formattedStreet = formatAddressReverse(shop.address, "Street");
            currentBarberShop.formattedCityState = formatAddressReverse(shop.address, "CityState");
            currentBarberShop.hoursOf = getHoursOfOperation(currentBarberShop.hoursOfOperation, true).html();

            $scope.currentBarberShops.push(currentBarberShop);
        });
    }
}

function buildBarberShopDetail(barberShop, $scope) {
    if (barberShop) {
        $scope.currentBarberShops = new Array();

        var currentBarberShop = new Object();

        currentBarberShop.barberShopID = barberShop.barberShopID;
        currentBarberShop.shopName = barberShop.shopName;
        currentBarberShop.totalBarbers = barberShop.totalBarbers;
        currentBarberShop.phoneNumber = barberShop.phoneNumber;
        currentBarberShop.hoursOfOperation = barberShop.hoursOfOperation;
        currentBarberShop.image = barberShop.image;

        if (barberShop.image.imageID > 0)
            currentBarberShop.image.defaultImage = barberShop.image.fileLocation + barberShop.image.fileName;

        currentBarberShop.address = barberShop.address;
        currentBarberShop.barberShopSpecialties = barberShop.barberShopSpecialties;
        currentBarberShop.barbers = barberShop.barbers;
        currentBarberShop.images = barberShop.images;
        currentBarberShop.customers = barberShop.customers;

        $scope.currentBarberShops.push(currentBarberShop);
    }
}

function buildAppointments(appointments, $scope, $filter, useFilter) {
    if (appointments) {
        var apts = appointments;

        $scope.currentAppointments = new Array();

        if (useFilter) {
            if (apts && apts.length > 0)
                apts = $filter('filter')(apts, { appointmentDate: new Date() }, function (actual, expected) {
                    var date = splitDate(actual);

                    return date.getYear() == expected.getYear() && date.getMonth() == expected.getMonth() && date.getDate() == expected.getDate();
                });
        }

       // $scope.currentAppointments = new Array();

        angular.forEach(useFilter ? apts : appointments, function (appointment, key) {
            var currentAppointment = new Object();

            currentAppointment.appointmentID = appointment.appointmentID;
            currentAppointment.barberID = appointment.barberID;
            currentAppointment.profileID = appointment.profileID;
            currentAppointment.wasCancelled = appointment.wasCancelled;
            currentAppointment.appointmentDate = appointment.appointmentDate;
            currentAppointment.aptDate = formatDate(appointment.appointmentDate);
            currentAppointment.appointmentStatus = appointment.appointmentStatus;
            if (appointment.barber) {
                currentAppointment.barber = appointment.barber;
                currentAppointment.displayName = appointment.barber.profile.displayName;

                if (appointment.barber.profile.image && appointment.barber.profile.image.imageID > 0)
                    appointment.barber.profile.image["defaultImage"] = appointment.barber.profile.image.fileLocation + appointment.barber.profile.image.fileName;

                currentAppointment.appointmentImage = getProfileImage(appointment.barber.profile.image, "Barber");
            }
            else
                if (appointment.profile) {
                    currentAppointment.profile = appointment.profile;
                    currentAppointment.displayName = appointment.profile.displayName;

                    if (appointment.profile.image && appointment.profile.image.imageID > 0)
                        appointment.profile.image["defaultImage"] = appointment.profile.image.fileLocation + appointment.profile.image.fileName;

                    currentAppointment.appointmentImage = getProfileImage(appointment.profile.image, "Profile");
                }

            $scope.currentAppointments.push(currentAppointment);
        });
    }
}

function renderUserAppointments($scope, $filter) {
    var container = $("<div/>").addClass("list-group ").css("background-color", "#4b4d4e");
    
    if ($scope.currentAppointments && $scope.currentAppointments.length > 0)
    	$scope.currentAppointments = $filter('filter')($scope.currentAppointments, { appointmentDate: new Date() }, function(actual, expected){
    	    var date = splitDate(actual);
    		
    		return date.getYear() == expected.getYear() && date.getMonth() == expected.getMonth() && date.getDay() == expected.getDay();
    	});

    container.append($("<div/>").append(
                                        $("<label/>").text("Appointments  ")
                                        			 .append($("<span/>").addClass("badge").text($scope.currentAppointments != null ? $scope.currentAppointments.length : 0))
                                                     .css({ "color": "white", "padding-left": "5px" })
                                ).css("background-color", "#4b4d4e")
                      );

    $("#conDiv").empty();

    if ($scope.currentAppointments && $scope.currentAppointments.length > 0) {
        angular.forEach($scope.currentAppointments, function (currentAppointment, key) {
            var profile;

            if (currentAppointment.barber)
                profile = currentAppointment.barber.profile;
            else
                profile = currentAppointment.profile;

            var appointment = $("<div/>").addClass("list-group-item list-group-item-inverse").css("background-color", "#4b4d4e");

            var appointmentImage = $("<img/>").prop("src", getProfileImage(profile.image, "")).css("width", "70px").css("height", "100px");
            var appointmentName = $("<h4/>").addClass("media-heading").text(profile.displayName).css("color", "white");
            var appointmentStatus = $("<label/>").text("Appointment Status: " + currentAppointment.appointmentStatus.appointmentStatus).css("color", "white");
            var appointmentDate = $("<label/>").text("Appointment Date: " + formatDate(currentAppointment.appointmentDate)).css("color", "white");
            var cancelButton = $("<button/>").addClass("btn btn-inverse").text("Cancel").attr("value", currentAppointment.appointmentID).click(function()
            {
            	var but = $(this);
            	angular.forEach($scope.currentAppointments, function(appointment, key){
            		if(appointment.appointmentID == $(but).val())
            			$scope.deleteAppointment(appointment);
            	});
            });
            
            var appointmentCon = $("<div/>").addClass("media")
                                     .append(
                                        $("<a/>").addClass("pull-left")
                                                    .append(appointmentImage)
                                     ).append(
                                        $("<div/>").addClass("media-body")
                                                    .append(appointmentName)
                                                    .append(appointmentStatus)
                                                    .append("<br/>")
                                                    .append(appointmentDate)
                                                    .append(currentAppointment.appointmentStatus.appointmentStatus != "Cancelled" ? cancelButton : "")
                                     ).css("background-color", "#4b4d4e");

            appointment.append(appointmentCon)
                       .append($("<hr/>"));

            container.append(appointment);

            //dataObjects.push(barberShop);
        });
    } else {
        container.append($("<div/>").append($("<label/>").text("You have no appointments scheduled for today!")
                                                         .css({
                                                             "color": "white",
                                                             "padding-left": "5px",
                                                             "text-align": "center"
                                                         })
                                            )//.append($("<hr/>"))
                                             .css("background-color", "#4b4d4e")
                                             .css("height", "90%")
                         );
    }

    $("#conDiv").append(container);
}

function renderUserBarberShops($scope) {
    var container = $("<div/>").addClass("list-group ").css("background-color", "#4b4d4e");

    container.append($("<div/>").append(
                                        $("<label/>").text("Your Barber Shops  ")
                           			 				 .append($("<span/>").addClass("badge").text($scope.currentBarberShops != null ? $scope.currentBarberShops.length : 0))
                                                     .css({ "color": "white", "padding-left": "5px" })
                                       ).css("background-color", "#4b4d4e")
                    );

    if ($scope.currentBarberShops && $scope.currentBarberShops.length > 0) {
        angular.forEach($scope.currentBarberShops, function (barberShop, key) {
            var shop = $("<div/>").addClass("list-group-item list-group-item-inverse").css("background-color", "#4b4d4e");

            var shopImage = $("<img/>").prop("src", getProfileImage(barberShop.image, "barberShop")).css("width", "70px").css("height", "100px");
            var shopName = $("<h4/>").addClass("media-heading").text(barberShop.shopName).css("color", "white");
            var shopAddress = $("<label/>").text(formatAddressReverse(barberShop.address, "Street")).css("color", "white");
            var shopCityState = $("<label/>").text(formatAddressReverse(barberShop.address, "CityState")).css("color", "white");
            var shopPhoneNumber = $("<label/>").text(barberShop.phoneNumber).css("color", "white");
            var defaultButton = $("<button/>").addClass("btn btn-inverse").text("View Shop").attr("value", barberShop.barberShopID).click(function()
            {
                getPageView("index.html", "barbershop.html", "barberShopID=" + $(this).val() + "&caller=index.html", false);
            	//getPageView("index.html", "index.html#/barbershop/" + $(this).val(), null, false);
            });

            var shopCon = $("<div/>").addClass("media")
                                     .append(
                                        $("<a/>").addClass("pull-left")
                                                    .append(shopImage)
                                     ).append(
                                        $("<div/>").addClass("media-body")
                                                    .append(shopName)
                                                    .append(shopAddress)
                                                    .append("<br/>")
                                                    .append(shopCityState)
                                                    .append("<br/>")
                                                    .append(shopPhoneNumber)
                                                    .append(getHoursOfOperation(barberShop.hoursOfOperation))
                                                    .append(defaultButton)
                                     ).css("background-color", "#4b4d4e");

            shop.append(shopCon)
                .append($("<hr/>"));

            container.append(shop);
        });
    } else {
        container.append($("<div/>").append($("<label/>").text("You have no barber shops set!")
                                                         .css({
                                                             "color": "white",
                                                             "padding-left": "5px",
                                                             "text-align": "center"
                                                         })
                                    )
                                    //.append($("<hr/>"))
                                    .css("background-color", "#4b4d4e")
                                    .css("height", "90%")
                        );
    }

    $("#conDiv").append(container);
}

function renderBarberShopDetails($scope)
{
    if($scope.currentBarberShops && $scope.currentBarberShops.length > 0)
    {
        //$("#conDiv").empty();

        var container = $("<div/>").addClass("list-group ");

        angular.forEach($scope.currentBarberShops, function (barberShop, key) {
            var shop = $("<div/>").addClass("list-group-item list-group-item-inverse").css("background-color", "#4b4d4e");
            
            var shopImage = $("<img/>").prop("src", getProfileImage(barberShop.image, "barberShop")).css("width", "70px").css("height", "100px");
            var shopName = $("<h4/>").addClass("media-heading").text(barberShop.shopName).css("color", "white");
            var shopAddress = $("<label/>").text(formatAddressReverse(barberShop.address, "Street")).css("color", "white");
            var shopCityState = $("<label/>").text(formatAddressReverse(barberShop.address, "CityState")).css("color", "white");
            var shopPhoneNumber = $("<label/>").text(barberShop.phoneNumber).css("color", "white");

            var shopCon = $("<div/>").addClass("media")
                                     .append(
                                        $("<a/>").addClass("pull-left")
                                                    .append(shopImage)
                                     ).append(
                                        $("<div/>").addClass("media-body")
                                                    .append(shopName)
                                                    .append(shopAddress)
                                                    .append("<br/>")
                                                    .append(shopCityState)
                                                    .append("<br/>")
                                                    .append(shopPhoneNumber)
                                                    .append(getHoursOfOperation(barberShop.hoursOfOperation))
                                     ).css("background-color", "#4b4d4e");

            var shopTabs = $("<ul/>").addClass("nav nav-tabs")
                                     .append(
                                            $("<li/>").append(
                                                            $("<a/>").attr("toggle", "on")
                                                                     .attr("parent-active-class", "active")
                                                                     .text("Gallery")
                                                                     .css("color", "black")
                                                                     .prop("href", "#shopGallery" + barberShop.barberShopID)
                                              ),
                                              $("<li/>").append(
                                                            $("<a/>").attr("toggle", "on")
                                                                     .attr("parent-active-class", "active")
                                                                     .text("Barbers")
                                                                     .css("color", "black")
                                                                     .prop("href", "#shopBarbers" + barberShop.barberShopID)
                                              ),
                                              $("<li/>").append(
                                                            $("<a/>").attr("toggle", "on")
                                                                     .attr("parent-active-class", "active")
                                                                     .text("Customers")
                                                                     .css("color", "black")
                                                                     .prop("href", "#shopCustomers" + barberShop.barberShopID)
                                              )
                                    );
            var tabContent = $("<div/>").addClass("tab-content")
                                        .append(
                                               $("<div/>").addClass("tab-pane")
                                                          .prop("id", "shopGallery" + barberShop.barberShopID)
                                                          .attr("toggleable", "")
                                                          .attr("active-class", "active")
                                                          .attr("default", "active")
                                                          .attr("exclusion-group", "shopTabs")
                                                          .append(renderBarbers(barberShop.barbers))
                                                          .css("display", "block"),
                                                $("<div/>").addClass("tab-pane")
                                                          .prop("id", "shopBarbers" + barberShop.barberShopID)
                                                          .attr("toggleable", "")
                                                          .attr("active-class", "active")
                                                          //.attr("default", "active")
                                                          .attr("exclusion-group", "shopTabs")
                                                          .append("hi"),
                                                $("<div/>").addClass("tab-pane")
                                                          .prop("id", "shopCustomers" + barberShop.barberShopID)
                                                          .attr("toggleable", "")
                                                          .attr("active-class", "active")
                                                          //.attr("default", "active")
                                                          .attr("exclusion-group", "shopTabs")
                                                          .append(renderCustomers(barberShop.customers))
                                        );
            /*var defaultButton = $("<button/>").addClass("btn btn-inverse").text("Set as your shop").attr("value", barberShop.name).click(function () {
                if (dataObjects) {
                    var button = $(this);

                    angular.forEach(dataObjects, function (shop, key) {
                        if (shop.name == button.attr("value")) {
                            //check for more details on the shop
                            var request = {
                                reference: shop.reference
                            };

                            var service = new google.maps.places.PlacesService(map);
                            service.getDetails(request, function (results, status) {
                                if (status == google.maps.places.PlacesServiceStatus.OK) {
                                    //update the shop information
                                    shop.phoneNumber = results.formatted_phone_number;
                                    //shop.website = results.website;
                                }

                                $scope.createBarberShop(shop);
                            });

                        }
                    });
                }
            });
            var distance = $("<label/>").text("Distance: " + calculateDistance(38.643517, -77.260843, barberShop.geometry.location.k, barberShop.geometry.location.A, "M") +
                            " miles away").css("color", "white");*/

            shop.append(shopCon)
                .append($("<hr/>"))
                .append($("<label/>").text("Shop Specialties").css("color", "white"))
                .append(getSpecialties(barberShop.barberShopSpecialties))
                .append($("<hr/>"))
                .append($("<div/>").addClass("container").append(shopTabs,
                tabContent))
                .append($("<hr/>"))
                //.append($("<label/>").text("Barbers").css("color", "white"))
                //.append(renderBarbers(barberShop.barbers))
                /*.append($("<i/>").addClass("fa fa-chevron-right pull-right").val("::before").css("color", "white"))
                .append($("<br/>"))
                .append(distance)
                .append($("<br/>"))
                .append(defaultButton)*/;


            container.append(shop);

            //dataObjects.push(barberShop);
        });

        $("#conDiv").append(container);
    }
}

function getHoursOfOperation(hoursOfOperation, useBreak, asList, $scope)
{
    if(hoursOfOperation)
    {
        try
        {
            var today = new Date().getDay();
            var dayOfWeek;
            var weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
            var hours = [];

            switch(today)
            {
                case 0:
                    today = hoursOfOperation.sunday;
                    dayOfWeek = "Sunday";
                    hours[dayOfWeek] = hoursOfOperation.sunday;
                    break;
                case 1:
                    today = hoursOfOperation.monday;
                    dayOfWeek = "Monday";
                    hours[dayOfWeek] = hoursOfOperation.monday;
                    break;
                case 2:
                    today = hoursOfOperation.tuesday;
                    dayOfWeek = "Tuesday";
                    hours[dayOfWeek] = hoursOfOperation.tuesday;
                    break;
                case 3:
                    today = hoursOfOperation.wednesday;
                    dayOfWeek = "Wednesday";
                    hours[dayOfWeek] = hoursOfOperation.wednesday;
                    break;
                case 4:
                    today = hoursOfOperation.thursday;
                    dayOfWeek = "Thursday";
                    hours[dayOfWeek] = hoursOfOperation.thursday;
                    break;
                case 5:
                    today = hoursOfOperation.friday;
                    dayOfWeek = "Friday";
                    hours[dayOfWeek] = hoursOfOperation.friday;
                    break;
                case 6:
                    today = hoursOfOperation.saturday;
                    dayOfWeek = "Saturday";
                    hours[dayOfWeek] = hoursOfOperation.saturday;
                    break;            
            }

            angular.forEach(weekdays, function (day, key) {
                switch (day) {
                    case "Sunday":
                        hours[day] = hoursOfOperation.sunday;
                        break;
                    case "Monday":
                        hours[day] = hoursOfOperation.monday;
                        break;
                    case "Tuesday":
                        hours[day] = hoursOfOperation.tuesday;
                        break;
                    case "Wednesday":
                        hours[day] = hoursOfOperation.wednesday;
                        break;
                    case "Thursday":
                        hours[day] = hoursOfOperation.thursday;
                        break;
                    case "Friday":
                        hours[day] = hoursOfOperation.friday;
                        break;
                    case "Saturday":
                        hours[day] = hoursOfOperation.saturday;
                        break;
                }
            });

            var dayHours = $("<div/>").css("width", "100%");

            if (useBreak)
                angular.forEach(weekdays, function (day, key) {
                    dayHours.append(
                        $("<label/>").text(day + ": " + (hours[day] == undefined ? "N/A" : hours[day]))
                                     .css({
                                         "color": "white",
                                         "padding-right": "5px"
                                     }),
                        $("</br>")
                    );
                });
            else
                if (asList) {
                    if ($scope) {
                        $scope.hoursOfImp = [];

                        angular.forEach(weekdays, function (day, key) {
                            var hour = { day: day, time: (hours[day] == undefined ? "N/A" : hours[day]) };

                            $scope.hoursOfImp.push(hour);
                        });
                    }
                }
                else
                    angular.forEach(weekdays, function (day, key) {
                        dayHours.append(
                            $("<label/>").text(" " + day + ": " + (hours[day] == undefined ? "N/A" : hours[day]))
                                         .css({
                                             "color": "white",
                                             "padding-right": "5px"
                                         }),
                            $("</br>")
                        );
                    });
            
            if (useBreak) {
                return $("<div/>").append(
                            $("<label/>").text("Today: " + (today != undefined ? today : "No hours posted")).css("color", "white")
                        );//.append(dayHours);
            } else
                {
                    return $("<div/>").append(
                                $("<label/>").text("Today: " + (today != undefined ? today : "No hours posted")).css("color", "white")
                            ).append(dayHours);
                }
        }catch(err)
        {
            return $("<div/>").append($("<label/>").text("No Hours of Operation posted").css("color", "white"));
        }
    }

    return $("<div/>").append($("<label/>").text("No Hours of Operation posted").css("color", "white"));
}

function getSpecialties(Specialties, asList, $scope) {
    if (Specialties) {
        try
        {
            var con = $("<div/>");
            var i = 0;
            
            if (Specialties.length > 0 && !asList) {
                angular.forEach(Specialties, function (specialty, key) {
                    con.append(
                        $("<label/>").text((i > 0 ? ", " : "") + specialty.specialty).css("color", "white")
                    );

                    i++;
                })
            } else
                if (asList) {
                    if ($scope && Specialties.length > 0) {
                        $scope.specialtiesImp = [];

                        angular.forEach(Specialties, function (specialty, key) {
                            var special = { specialty: specialty.specialty };

                            $scope.specialtiesImp.push(special);
                        });
                    }
                } else {
                    return $("<div/>").append($("<label/>").text("No Specialties posted"));
                }
            
            return con;
        } catch (err) {
            return $("<div/>").append($("<label/>").text("No Specialties posted").css("color", "white"));
        }
    }

    return $("<div/>").append($("<label/>").text("No Specialties posted").css("color", "white"));
}

function renderBarbers(barbers, $scope) {
    if (barbers && barbers.length > 0) {
        var container = $("<div/>").addClass("list-group ").css("height", "100%");

        angular.forEach(barbers, function (barber, key) {
            var shopBarber = $("<div/>").addClass("list-group-item list-group-item-inverse").css("background-color", "#4b4d4e");

            var barberImage = $("<img/>").prop("src", getProfileImage(barber.image, "barber")).css("width", "100px").css("height", "100px");
            var barberName = $("<h4/>").addClass("media-heading").text(/*"Name: " +*/ barber.profile.displayName).css("color", "white");
            var profileButton = getButton("View Profile").val(barber.barberID).css("padding-right", "15px").click(function(){
            	getPageView("barbershop.html", "barber.html", "barberID=" + $(this).val() + "&" + encodeURIComponent("caller=\"barbershop.html?barberShopID=" + barber.barberShopID + "\""), false);
            });
            var apptButton = getButton("Make Appointment").val(barber.barberID).click(function() {
            	getPageView("barbershop.html", "appointment.html", "barberID=" + $(this).val() + "&" + encodeURIComponent("caller=\"barbershop.html?barberShopID=" + barber.barberShopID + "\""), false);
        	});

            var barberCon = $("<div/>").addClass("media")
                                       .append(
                                            $("<a/>").addClass("pull-left")
                                                     .append(barberImage)
                                       ).append(
                                            $("<div/>").addClass("media-body")
                                                       .append(barberName)
                                                       .append(getBarberStatus(barber.barberStatus))
                                                       .append($("<label/>").text("Accepts Appointments: " + convertBoolean(barber.acceptsAppointments)).css("color", "white"))
                                                       .append(getRating(barber.rating))
                                                       .append(profileButton)
                                                       .append("&nbsp;")
                                                       .append(barber.acceptsAppointments == "true" && barber.profile.profileID != $scope.mbsProfileID ? apptButton : $("<div/>"))
                                       ).css("background-color", "#4b4d4e");

            shopBarber.append(barberCon);

            container.append(shopBarber);
        });

        return container;
    }

    return $("<div/>").append($("<label/>").text("No Barbers at this shop currently.").css("color", "white"));
}

function renderGallery(images, parent) {
    if (images && images.length > 0) 
    { 
    	var con = $("<div/>").addClass("list-group ");

        //var shopBarber = $("<div/>").addClass("list-group-item list-group-item-inverse").css("background-color", "#4b4d4e");
        var container = $("<div/>").prop("id", "blueimp-gallery").addClass("blueimp-gallery");
        
        var slides = $("<div/>").addClass("slides");
        var title = $("<h3/>").addClass("title");
        var prev = $("<a/>").addClass("prev").text("<");
        var next = $("<a/>").addClass("next").text(">");
        var close = $("<a/>").addClass("close").text("x");
        var playpause = $("<a/>").addClass("play-pause");
        var indicator = $("<ol/>").addClass("indicator");
  
        var lightBox = $("<div/>").addClass("modal fade")
        						  .append(
    								  $("<div/>").addClass("modal-content")
    								  			 .append(
								  					 $("<div/>").addClass("modal-header")
								  					 		    .append(
						  					 		    			$("<button/>").prop("type", "button")
						  					 		    						  .addClass("close")
						  					 		    						  .attr("aria-hidden", "true")
						  					 		    						  .text("X"),
		  					 		    						    $("<h4/>").addClass("modal-title")
								  					 		    ),
					  					 		    $("<div/>").addClass("modal-body next"),
					  					 		    $("<div/>").addClass("modal-footer")
					  					 		    		   .append( 
				  					 		    				   $("<button/>").prop("type", "button")
				  					 		    				   				 .addClass("btn btn-default pull-left prev")
				  					 		    				   				 .append( 
			  					 		    				   						 $("<i/>").addClass("glyphicon glyphicon-chevron-left")
				  					 		    				   				 )
				  					 		    				   				 .text("< Previous"),
		  					 		    				   		   $("<button/>").prop("type", "button")
	  					 		    				   				 			 .addClass("btn btn-primary next")
	  					 		    				   				 			 .text("Next")
	  					 		    				   				 			 .append( 
  					 		    				   				 					 $("<i/>").addClass("glyphicon glyphicon-chevron-right")
	  					 		    				   				 			 )	 
					  					 		    		   )
    								  			 )
								  );
        
        container.append(slides, title, prev, next, close, playpause, indicator/*, lightBox*/);

        var links = $("<div/>").prop("id", "links").addClass("links");
        
        angular.forEach(images, function (image, key) {
            var img = $("<a/>").prop("href", IMAGE_ENDPOINT + image.fileLocation + image.fileName)
            					 .attr("title", image.caption)
            					 .attr("data-gallery", "")
            					 .append( 
        							 $("<img/>").prop("src", IMAGE_ENDPOINT + image.fileLocation + image.fileName)
        							 		    .prop("alt", image.caption)
        							 		    .css({
    							 		    		"width": "100px",
    							 		    		"height": "100px"
        							 		    })
            					 ); 
            
            links.append(img);
        });
        
        $(parent).append(links, container);

        return null;
    }

    return $("<div/>").append($("<label/>").text("No Images at this shop currently.").css("color", "white"));
}

function renderUserGallery(images) 
{
    if (images && images.length > 0) 
    { 
    	var con = $("<div/>").addClass("list-group ");

        //var shopBarber = $("<div/>").addClass("list-group-item list-group-item-inverse").css("background-color", "#4b4d4e");
        var container = $("<div/>").prop("id", "blueimp-gallery").addClass("blueimp-gallery");
        
        var slides = $("<div/>").addClass("slides");
        var title = $("<h3/>").addClass("title");
        var prev = $("<a/>").addClass("prev").text("<");
        var next = $("<a/>").addClass("next").text(">");
        var close = $("<a/>").addClass("close").text("x");
        var playpause = $("<a/>").addClass("play-pause");
        var indicator = $("<ol/>").addClass("indicator");
  
        var lightBox = $("<div/>").addClass("modal fade")
        						  .append(
    								  $("<div/>").addClass("modal-content")
    								  			 .append(
								  					 $("<div/>").addClass("modal-header")
								  					 		    .append(
						  					 		    			$("<button/>").prop("type", "button")
						  					 		    						  .addClass("close")
						  					 		    						  .attr("aria-hidden", "true")
						  					 		    						  .text("X"),
		  					 		    						    $("<h4/>").addClass("modal-title")
								  					 		    ),
					  					 		    $("<div/>").addClass("modal-body next"),
					  					 		    $("<div/>").addClass("modal-footer")
					  					 		    		   .append( 
				  					 		    				   $("<button/>").prop("type", "button")
				  					 		    				   				 .addClass("btn btn-default pull-left prev")
				  					 		    				   				 .append( 
			  					 		    				   						 $("<i/>").addClass("glyphicon glyphicon-chevron-left")
				  					 		    				   				 )
				  					 		    				   				 .text("< Previous"),
		  					 		    				   		   $("<button/>").prop("type", "button")
	  					 		    				   				 			 .addClass("btn btn-primary next")
	  					 		    				   				 			 .text("Next")
	  					 		    				   				 			 .append( 
  					 		    				   				 					 $("<i/>").addClass("glyphicon glyphicon-chevron-right")
	  					 		    				   				 			 )	 
					  					 		    		   )
    								  			 )
								  );
        
        container.append(slides, title, prev, next, close, playpause, indicator/*, lightBox*/);

        var links = $("<div/>").prop("id", "links").addClass("links");
        
        angular.forEach(images, function (image, key) {
            var img = $("<a/>").prop("href", IMAGE_ENDPOINT + image.fileLocation + image.fileName)
            					 .attr("title", image.caption)
            					 .attr("data-gallery", "")
            					 .append( 
        							 $("<img/>").prop("src", IMAGE_ENDPOINT + image.fileLocation + image.fileName)
        							 		    .prop("alt", image.caption)
        							 		    .css({
    							 		    		"width": "100px",
    							 		    		"height": "100px"
        							 		    })
            					 ); 
            
            links.append(img);
        });
        
        $("#barberGallery").append(links, container);

        return null;
    }

    return $("<div/>").append($("<label/>").text("No Images for this barber currently.").css("color", "white"));
}

/*function renderShopGallery(images) {
    if (images) {
        var container = $("<div/>").addClass("carousel slide").attr("data-ride", "carousel");

        angular.forEach(images, function (image, key) {
            var shopBarber = $("<div/>").addClass("list-group-item list-group-item-inverse").css("background-color", "#4b4d4e");

            var barberImage = $("<img/>").prop("src", getProfileImage(barber.image, "barber")).css("width", "100px").css("height", "100px");
            var barberName = $("<h4/>").addClass("media-heading").text(/*"Name: " + barber.profile.displayName).css("color", "white");

            var barberCon = $("<div/>").addClass("media")
                                       .append(
                                            $("<a/>").addClass("pull-left")
                                                     .append(barberImage)
                                       ).append(
                                            $("<div/>").addClass("media-body")
                                                       .append(barberName)
                                                       .append(getBarberStatus(barber.barberStatus))
                                                       .append($("<label/>").text("Accepts Appointments: " + convertBoolean(barber.acceptsAppointments)).css("color", "white"))
                                                       .append(getRating(barber.rating))
                                                       .append(getButton("View Profile"))
                                       ).css("background-color", "#4b4d4e");

            var shopAddress = $("<label/>").text(formatAddressReverse(barberShop.address, "Street")).css("color", "white");
            var shopCityState = $("<label/>").text(formatAddressReverse(barberShop.address, "CityState")).css("color", "white");
            var shopPhoneNumber = $("<label/>").text(barberShop.phoneNumber).css("color", "white");
            var defaultButton = $("<button/>").addClass("btn btn-inverse").text("Set as your shop").attr("value", barberShop.name).click(function () {
                if (dataObjects) {
                    var button = $(this);

                    angular.forEach(dataObjects, function (shop, key) {
                        if (shop.name == button.attr("value")) {
                            //check for more details on the shop
                            var request = {
                                reference: shop.reference
                            };

                            var service = new google.maps.places.PlacesService(map);
                            service.getDetails(request, function (results, status) {
                                if (status == google.maps.places.PlacesServiceStatus.OK) {
                                    //update the shop information
                                    shop.phoneNumber = results.formatted_phone_number;
                                    //shop.website = results.website;
                                }

                                $scope.createBarberShop(shop);
                            });

                        }
                    });
                }
            });
            var distance = $("<label/>").text("Distance: " + calculateDistance(38.643517, -77.260843, barberShop.geometry.location.k, barberShop.geometry.location.A, "M") +
                            " miles away").css("color", "white");

            shopBarber.append(barberCon)
                      /*.append(barberName)
                .append($("<br/>"))
                .append(shopAddress)
                .append($("<br/>"))
                .append(shopCityState)
                .append($("<br/>"))
                .append(shopPhoneNumber)
            .append($("<i/>").addClass("fa fa-chevron-right pull-right").val("::before").css("color", "white"))
            .append($("<br/>"))
            .append(distance)
            .append($("<br/>"))
            .append(defaultButton);


            container.append(shopBarber);

            //dataObjects.push(barberShop);
        });

        return container;
    }

    return $("<div/>").append($("<label/>").text("No Barbers at this shop currently.").css("color", "white"));
}*/

function renderCustomers(customers) {
    if (customers && customers.length > 0) {
        var container = $("<div/>").addClass("list-group ").css("width", "100%");

        angular.forEach(customers, function (customer, key) {
            var shopCustomer = $("<div/>").addClass("list-group-item list-group-item-inverse").css("background-color", "#4b4d4e");

            var customerImage = $("<img/>").prop("src", getProfileImage(customer.image, "profile")).css("width", "100px").css("height", "100px");
            var customerName = $("<h4/>").addClass("media-heading").text(customer.profile.displayName).css("color", "white");
            var dateCreated = splitDate(customer.dateCreated);
            var profileButton = getButton("View Profile").val(customer.profile.profileID).click(function (){
            	getPageView("barbershop.html", "profile.html", "profileID=" + $(this).val() + "&" + encodeURIComponent("caller=\"barbershop.html?barberShopID=" + customer.barberShopID + "\""), false);
            });
            
            var customerCon = $("<div/>").addClass("media")
                                       .append(
                                            $("<a/>").addClass("pull-left")
                                                     .append(customerImage)
                                       ).append(
                                            $("<div/>").addClass("media-body")
                                                       .append(customerName)
                                                       .append($("<label/>").text("Customer Since: " + getReadableMonth(dateCreated.getMonth()) + " " 
                                                    		   					  + dateCreated.getDate() + ", " + dateCreated.getFullYear()).css("color", "white"))
                                                       .append($("<br/>"))
                                                       .append(profileButton)
                                       ).css("background-color", "#4b4d4e");

            shopCustomer.append(customerCon);

            container.append(shopCustomer);
        });

        return container;
    }

    return $("<div/>").append($("<label/>").text("No Customers at this shop currently.").css("color", "white"));
}

function renderClients(clients) {
    if (clients && clients.length > 0) {
        var container = $("<div/>").addClass("list-group ").css("width", "100%");

        angular.forEach(clients, function (client, key) {
            var barberClient = $("<div/>").addClass("list-group-item list-group-item-inverse").css("background-color", "#4b4d4e");

            var clientImage = $("<img/>").prop("src", getProfileImage(client.profile.image, "profile")).css("width", "100px").css("height", "100px");
            var clientName = $("<h4/>").addClass("media-heading").text(client.profile.displayName).css("color", "white");
            var dateCreated = splitDate(client.dateCreated);
            var profileButton = getButton("View Profile").val(client.profile.profileID).click(function (){
            	getPageView("barber.html", "profile.html", "profileID=" + $(this).val() + "&" + encodeURIComponent("caller=\"barber.html?barberID=" + client.barberID + "\""), false);
            });
            
            var clientCon = $("<div/>").addClass("media")
                                       .append(
                                            $("<a/>").addClass("pull-left")
                                                     .append(clientImage)
                                       ).append(
                                            $("<div/>").addClass("media-body")
                                                       .append(clientName)
                                                       .append($("<label/>").text("Client Since: " + getReadableMonth(dateCreated.getMonth()) + " " 
                                                    		   					  + dateCreated.getDate() + ", " + dateCreated.getFullYear()).css("color", "white"))
                                                       .append($("<br/>"))
                                                       .append(profileButton)
                                       ).css("background-color", "#4b4d4e");

            barberClient.append(clientCon);

            container.append(barberClient);
        });

        return container;
    }

    return $("<div/>").append($("<label/>").text("No Clients for this barber currently.").css("color", "white"));
}

function renderUserShops($scope, profileID/*, isProfile*/) {
    var container = $("<div/>").addClass("list-group ").css("background-color", "#4b4d4e").css("height", "100px");

    /*container.append($("<div/>").append(
                                        $("<label/>").text($scope.currentProfile.displayName + " Barber Shops")
                                                     .css({ "color": "white", "padding-left": "5px" })
                                       ).css("background-color", "#4b4d4e")
                    );*/

    if ($scope.currentBarberShops && $scope.currentBarberShops.length > 0) {
        angular.forEach($scope.currentBarberShops, function (barberShop, key) {
            var shop = $("<div/>").addClass("list-group-item list-group-item-inverse").css("background-color", "#4b4d4e");

            var shopImage = $("<img/>").prop("src", getProfileImage(barberShop.image, "barberShop")).css("width", "70px").css("height", "100px");
            var shopName = $("<h4/>").addClass("media-heading").text(barberShop.shopName).css("color", "white");
            var shopAddress = $("<label/>").text(formatAddressReverse(barberShop.address, "Street")).css("color", "white");
            var shopCityState = $("<label/>").text(formatAddressReverse(barberShop.address, "CityState")).css("color", "white");
            var shopPhoneNumber = $("<label/>").text(barberShop.phoneNumber).css("color", "white");
            var defaultButton = $("<button/>").addClass("btn btn-inverse").text("View Shop").attr("value", barberShop.barberShopID).click(function()
            {
                //window.location = document.URL.replace(, "barbershop.html?barberShopID=" + $(this).val());
            	//getPageView(isProfile == true ? "profile.html" : "index.html", "barbershop.html", "barberShopID=" + $(this).val() + "&" + 
            		//	    encodeURIComponent("caller=\"" + (isProfile == true ? "profile.html" : "index.html") + "?barberShopID=" + barberShop.barberShopID + "\""), false);
            	getPageView("profile.html", "barbershop.html", "barberShopID=" + $(this).val() + "&" + encodeURIComponent("caller=\"profile.html?profileID=" + profileID + "\""), false);
            });

            var shopCon = $("<div/>").addClass("media")
                                     .append(
                                        $("<a/>").addClass("pull-left")
                                                    .append(shopImage)
                                     ).append(
                                        $("<div/>").addClass("media-body")
                                                    .append(shopName)
                                                    .append(shopAddress)
                                                    .append("<br/>")
                                                    .append(shopCityState)
                                                    .append("<br/>")
                                                    .append(shopPhoneNumber)
                                                    .append(getHoursOfOperation(barberShop.hoursOfOperation))
                                                    .append(defaultButton)
                                     ).css("background-color", "#4b4d4e");

            shop.append(shopCon)
                .append($("<hr/>"));

            container.append(shop);
        });
        
        return container;
    } /*else {
        container.append($("<div/>").append($("<label/>").text("You have no barber shops set!")
                                                         .css({
                                                             "color": "white",
                                                             "padding-left": "5px",
                                                             "text-align": "center"
                                                         })
                                    )
                                    .append($("<hr/>"))
                                    .css("background-color", "#4b4d4e")
                        );
    }*/
    
    return $("<div/>").append($("<label/>").text("User has no barber shops set!").css("color", "white"));
}

function getProfileImage(image, type)
{
    if (image) {
        if (image.defaultImage) {
            return IMAGE_ENDPOINT + image.defaultImage;
        } else
            return "images/" + (type == "barberShop" ? "barberShopPole.jpg" : "default_image.gif");
    }

    return "images/default_image.gif";
}

function getRating(rating)
{
    if(rating)
    {
        return $("<div/>").append($("<label/>").text("Rating: " + rating.rating).css("color", "white"));
    }
}

function getBarberStatus(barberStatus)
{
    if(barberStatus)
    {
        return $("<div/>").append($("<label/>").text("Available: " + convertBoolean(barberStatus.isAvailable)).css("color", "white"));
    }
}

function convertBoolean(value)
{
    switch(value)
    {
        case "true": return "Yes";
        case "false": return "No";
    }
}

function formatDate(date) {
    if (date) {
        var newDate = splitDate(date);
        var today = newDate.getDate() == new Date().getDate() && newDate.getFullYear() == new Date().getFullYear() && newDate.getMonth() == new Date().getMonth() ? true : false;

        return (today == true ? "Today " : getReadableDay(newDate.getDay()) + " ") + getReadableMonth(newDate.getMonth()) + " " + newDate.getDate() + ", " + newDate.getFullYear() + " at " + getReadableTime(newDate);
    }

    return date;
}

function formatDateNoTime(date) {
    if (date) {
        var newDate = splitDate(date);
        var today = newDate.getDate() == new Date().getDate() && newDate.getFullYear() == new Date().getFullYear() && newDate.getMonth() == new Date().getMonth() ? true : false;

        return (today == true ? "Today " : getReadableDay(newDate.getDay()).substring(0, 3) + " ") + getReadableMonth(newDate.getMonth()).substring(0, 3) + " " + newDate.getDate() + ", " + newDate.getFullYear();
    }

    return date;
}

function formatDateNoTime2(date) {
    if (date) {
        var newDate = splitDate(date);
    
        return getReadableMonth(newDate.getMonth()) + " " + newDate.getDate() + ", " + newDate.getFullYear();
    }

    return date;
}

function getReadableMonth(month) {
    switch (month) {
        case 0: return "January";
        case 1: return "February";
        case 2: return "March";
        case 3: return "April";
        case 4: return "May";
        case 5: return "June";
        case 6: return "July";
        case 7: return "August";
        case 8: return "September";
        case 9: return "October";
        case 10: return "November";
        case 11: return "December";
    }
}

function getReadableDay(day) {
    switch (day) {
        case 0: return "Sunday";
        case 1: return "Monday";
        case 2: return "Tuesday";
        case 3: return "Wednesday";
        case 4: return "Thursday";
        case 5: return "Friday";
        case 6: return "Saturday";
    }
}

function getReadableDayForCalendar(day) {
    switch (day) {
        case 6: return "Sunday";
        case 0: return "Monday";
        case 1: return "Tuesday";
        case 2: return "Wednesday";
        case 3: return "Thursday";
        case 4: return "Friday";
        case 5: return "Saturday";
    }
}

function getReadableTime(time) {
    var newHours = time.getHours();
    var amPm = "AM";

    switch (time.getHours()) {
        case 13: newHours = 1; amPm = "PM"; break;
        case 14: newHours = 2; amPm = "PM"; break;
        case 15: newHours = 3; amPm = "PM"; break;
        case 16: newHours = 4; amPm = "PM"; break;
        case 17: newHours = 5; amPm = "PM"; break;
        case 18: newHours = 6; amPm = "PM"; break;
        case 19: newHours = 7; amPm = "PM"; break;
        case 20: newHours = 8; amPm = "PM"; break;
        case 21: newHours = 9; amPm = "PM"; break;
        case 22: newHours = 10; amPm = "PM"; break;
        case 23: newHours = 11; amPm = "PM"; break;
    }

    return newHours + ":" + (time.getMinutes() == 0 ? "00" : time.getMinutes()) + " " + amPm;
}

function getReadableGoogleHours(time) {
    var newHours = time.hours;
    var amPm = "AM";

    switch (time.hours) {
        case 13: newHours = 1; amPm = "PM"; break;
        case 14: newHours = 2; amPm = "PM"; break;
        case 15: newHours = 3; amPm = "PM"; break;
        case 16: newHours = 4; amPm = "PM"; break;
        case 17: newHours = 5; amPm = "PM"; break;
        case 18: newHours = 6; amPm = "PM"; break;
        case 19: newHours = 7; amPm = "PM"; break;
        case 20: newHours = 8; amPm = "PM"; break;
        case 21: newHours = 9; amPm = "PM"; break;
        case 22: newHours = 10; amPm = "PM"; break;
        case 23: newHours = 11; amPm = "PM"; break;
    }

    return newHours + ":" + (time.minutes == 0 ? "00" : time.minutes) + " " + amPm;
}

function decodeTime(time)
{
	var isAM = false;
	
	if(time.indexOf("AM") > -1)
		isAM = true;
	
	time = time.replace(" AM", "").replace(" PM", "");
	
	switch(time.trim())
	{
		case "7:00":
			return isAM == true ? 7.0 : 19.0; 
		case "7:30":
			return isAM == true ? 7.5 : 19.5;
		case "8:00":
			return isAM == true ? 8.0 : 20.0;
		case "8:30":
			return isAM == true ? 8.5 : 20.5;
		case "9:00":
			return isAM == true ? 9.0 : 21.0;
		case "9:30":
			return isAM == true ? 9.5 : 21.5;
		case "10:00":
			return isAM == true ? 10.0 : 22.0;
		case "10:30":
			return isAM == true ? 10.5 : 22.5;
		case "11:00":
			return isAM == true ? 11.0 : 23.0;
		case "11:30":
			return isAM == true ? 11.5 : 23.5;
		case "12:00":
			return isAM == true ? 24.0 : 12.0;
		case "12:30":
			return isAM == true ? 0.5 : 12.5;
		case "1:00":
			return isAM == true ? 1.0 : 13.0;
		case "1:30":
			return isAM == true ? 1.5 : 13.5;
		case "2:00":
			return isAM == true ? 2.0 : 14.0;
		case "2:30":
			return isAM == true ? 2.5 : 14.5;
		case "3:00":
			return isAM == true ? 3.0 : 15.0;
		case "3:30":
			return isAM == true ? 3.5 : 15.5;
		case "4:00":
			return isAM == true ? 4.0 : 16.0;
		case "4:30":
			return isAM == true ? 4.5 : 16.5;
		case "5:00":
			return isAM == true ? 5.0 : 17.0;
		case "5:30":
			return isAM == true ? 5.5 : 17.5;
		case "6:00":
			return isAM == true ? 6.0 : 18.0;
		case "6:30":
			return isAM == true ? 6.5 : 18.5;
	
	}
}

function getButton(label)
{
    return $("<button/>").addClass("btn").text(label);
}

function getNotification(title, message, transparent, type)
{
    var stack_bar_bottom = { "dir1": "up", "dir2": "right", "spacing1": 0, "spacing2": 0 };
    var stack_bottomright = { "dir1": "up", "dir2": "right", "firstpos1": 25, "firstpos2": 25 };

    return new PNotify({
        title: title,
        text: message,
        opacity: transparent ? .8 : 1,
        type: type,
        addClass: "stack-bottomright",
        cornerClass: "",
        width: "70%",
        stack: stack_bottomright/*,
        nonblock: {
            nonblock: true
        }*/
    });
}

function removeNotifications()
{
    PNotify.removeAll();
}

function showNavigation(page) {
    var tour = new Tour({ name: page });

    var steps = [];

    switch (page) {
        case "index":
            steps = [
                        {
                            element: "#tourSearch",
                            title: "Welcome to MyBarberShop",
                            content: "Start by searching for barber shops around you",
                            placement: "bottom"
                        },
                        {
                            orphan: true,
                            path: "search.html"
                        }
                    ]
            break;
        case "search":
            steps = [
                        {
                            orphan: true,
                            title: "Select a default Barber Shop",
                            content: "Select the closest barber shop near you",
                            backdrop: true
                        }
                    ]
            break;
    }

    tour.addSteps(steps);

    //tour.init();

    //tour.start();

    //tour.restart();
}

function showLoadingBar(message)
{
	$("body").append(
					  $("<div/>").addClass("progress progress-striped active mbsinner")
					  			 .css({
					  					"width": "90%",
					  					"bottom": "0px",
					  					"left": "20px",
					  					"position": "absolute",
					  					"display": "block",
					  					"z-index": "100"
					  			 }).append( 
			  							   $("<div/>").addClass("progress-bar")
			  							   			  .attr("role", "progressbar")
			  							   			  .attr("aria-valuenow", "100")
			  							   			  .attr("aria-valuemin", "0")
			  							   			  .attr("aria-valuemax", "100")
			  							   			  .css("width", "100%")
			  							   			  .append( 
			  							   					   $("<span/>").text(message)
  							   					      )
		   					     )
		   					     .prop("id", "loadingBar")
    );
}

function removeLoadingBar()
{
	$("#loadingBar").remove();
}

var tScope; 

function scheduleAppointment(apptDate, apptTime, $ionicPopup)
{
	if(apptDate && apptTime)
	{
	    apptDate = splitDate(apptDate);		
		//apptDate.setDate(apptDate.getDate() + 1);
		
		if (apptDate.getTime() >= new Date().getTime()) {
		    var hours = decodeTime(apptTime.trim());

		    minutes = hours.toString().indexOf(".") > -1 ? 30 : 0;
		    hours = hours.toString().indexOf(".") > -1 ? hours.toString().replace(".5", "") : hours;

		    apptDate = moment(apptDate);
		    
		    apptDate.set("minute", minutes);
		    apptDate.set("hours", hours);

		    tScope.createAppointment(apptDate);
		} else
		    //postStatusMessage("Appointments can only be made for " + formatDateNoTime(new Date()) + " or later", "error");
		    showIonicAlert($ionicPopup, null, 'Invalid Date', "Appointments can only be made for " + formatDateNoTime(new Date()) + " or later", "assertive", "button-assertive");
	}
}

function cancelAppointment(appt)
{
	if(appt && tScope)
	{
		angular.forEach(tScope.calendarEvents, function(event, key){
			if(appt == event.id)
				appt = event;
		});
		
		tScope.deleteAppointment(appt);
	}
}

function checkVacation(day, $scope)
{
	if(day && $scope.currentBarber)
	{
		//day.setDate(day.getDate() + 1);
		
		if($scope.currentBarber.barberStatus.vacationStartDate && $scope.currentBarber.barberStatus.vacationEndDate)
		{
		    var endDate = splitDate($scope.currentBarber.barberStatus.vacationEndDate);
			var isEndDay = false;
			
	   		if(day.getDate() == endDate.getDate() && day.getFullYear() == endDate.getFullYear() &&
   			   day.getMonth() == endDate.getMonth())
	   			isEndDay = true;
	   		
	   		if (day.getTime() >= splitDate($scope.currentBarber.barberStatus.vacationStartDate).getTime()
			   && day.getTime() <= splitDate($scope.currentBarber.barberStatus.vacationEndDate).getTime()
			   || isEndDay)
				return true;
		}
	}	
	
	return false;
}

function getAvailableAppointmentTimes($scope, day, events, slider, calendar, $filter)
{
	tScope = $scope;
	
    //filter out appt times
    if($scope.barberSchedule && $scope.barberSchedule.barberScheduleID > 0)
    {
       var hours = $scope.barberSchedule[getReadableDayForCalendar(day.getDay()).toLowerCase()];
       
       if(hours != null && hours != "OFF" && !checkVacation(day, $scope))
	   {
          $scope.apptTimes = {};
          
    	  var timeframe = hours.split("-");
    	  
    	  var start = decodeTime(timeframe[0].trim());
    	  var end = decodeTime(timeframe[1].trim());
    	  
    	  for(var i = start; i <= end;)
		  {
    		  var reCon;

    		  if(i.toString().indexOf(".5") > -1)
			  {
    			  reCon = (i > 12.5 ? i - 12 : i).toString().replace(".5", "") + ":30 " + (i < 12 ? "AM" : "PM");
    			  $scope.apptTimes[reCon] = reCon;
			  }else
				  {
					  reCon = (i > 12.5 ? i - 12 : i).toString().replace(".0", "") + ":00 " + (i < 12 ? "AM" : "PM");
	    			  $scope.apptTimes[reCon] = reCon;
				  }
    		  i+= .5;
		  }
    	  
    	  if($scope.barberSchedule.blackOutTime)
		  {
    		  timeframe = $scope.barberSchedule.blackOutTime.split("-");
    		  
    		  start = decodeTime(timeframe[0].trim());
        	  end = decodeTime(timeframe[1].trim());
        	  
        	  for(var i = start; i <= end;)
    		  {
        		  var reCon;
        		  
	    		  if(i.toString().indexOf(".5") > -1)
				  {
	    			  reCon = (i > 12.5 ? i - 12 : i).toString().replace(".5", "") + ":30 " + (i < 12 ? "AM" : "PM");
	    			  $scope.apptTimes[reCon] = null;
				  }else
					  {
						  reCon = (i > 12.5 ? i - 12 : i).toString().replace(".0", "") + ":00 " + (i < 12 ? "AM" : "PM");
		    			  $scope.apptTimes[reCon] = null;
					  }

        		  i+= .5;
    		  }
		  }
    	  
    	  //slider.animate({height: "400px"}, "fast");
	   }else
		   if(hours == "OFF" || checkVacation(day, $scope))
		   {
			   //slider.stop(false, true).slideToggle("fast");
		       //calendar.activecell = 0;
		       showCordovaAlert($scope.$cordovaDialogs, "Barber Unavailable", $scope.currentBarber.profile.displayName + " is unavailable for appointments at this time!", "OK");

		       return false;
		   }else
			   {
			   		getDefaultApptTimes($scope);
			   }       

       //$scope.apptTimes = $filter('orderBy')($scope.apptTimes, null, false);
       //$scope.apptTimes.sort();

       if(events && events.length > 0)
	   {
    	   angular.forEach(events, function (event, key) {
    	       if (event.wasCancelled == "false")
    	           $scope.apptTimes[event.time] = event.time + " - Taken";
           });            
       }
    }
    
    return $scope.apptTimes;
}

function getDefaultApptTimes($scope)
{
	$scope.apptTimes = {};
	
	for(var i = 8; i <= 20; i++)
    {
 	   if(i >= 12)
	   {
 		   $scope.apptTimes[((i == 12 ? "12" : (i - 12)) + ":00 PM")] = ((i == 12 ? "12" : (i - 12)) + ":00 PM");
 		   $scope.apptTimes[((i == 12 ? "12" : (i - 12)) + ":30 PM")] = ((i == 12 ? "12" : (i - 12)) + ":30 PM");
	   }else
	   {
		   $scope.apptTimes[(i + ":00 AM")] = (i + ":00 AM");
		   $scope.apptTimes[(i + ":30 AM")] = (i + ":30 AM");
	   }
    }
}

var messenger; 

function postStatusMessage(message, type)
{
	Messenger.options = {
		extraClasses: 'messenger-fixed messenger-on-bottom messenger-on-right',
		theme: 'future'
	}
	
	messenger = Messenger().post(
    {
    	message: message,
    	type: type,
    	//hideAfter: 5000,
    	hideOnNavigate: true
    });
}

function postStatusMessageWithActions(message, type, actions)
{
	Messenger.options = {
		extraClasses: 'messenger-fixed messenger-on-bottom messenger-on-right',
		theme: 'future'
	}
	
	messenger = Messenger().post(
    {
    	message: message,
    	type: type,
    	//hideAfter: 5000,
    	hideOnNavigate: true,
    	actions: actions
    });
}

function updateStatusMessage(message, type)
{
	if(messenger)
	{
		messenger.update({
			type: type,
			message: message
		});
	}else
		postStatusMessage(message, type);
}

function showIonicAlert($ionicPopup, $timeout, title, message, type, buttonType)
{
    var alertPopup = $ionicPopup.alert({
        title: title,
        template: '<span class="' + type + '" style="text-align:center;">' + message + '</span>',
        okType: buttonType
    });

    alertPopup.then(function (res) {

    });

    if ($timeout) {
        $timeout(function () {
            alertPopup.close();
        }, 3000);
    }
}

function showCordovaAlert($cordovaDialogs, title, message, buttonText) {
    var alertPopup = $cordovaDialogs.alert(message, title, buttonText).then(function () {

    });

    /*if ($timeout) {
        $timeout(function () {
            alertPopup.close();
        }, 3000);
    }*/
}

function toggleIonicLoading($ionicLoading, message, show, useDuration, type)
{
    if (show && useDuration) {
        $ionicLoading.show({
            template: '<div> <i class="icon ion-load-c"></i> <br/> <span class="' + type + ' "> &nbsp;' + message + '</span> </div>',
            duration: (1.5 * 1000)
        });
    } else
        if (show) {
            $ionicLoading.show({
                template: '<div> <i class="icon ion-load-c"></i> <br/> <span class="' + type + ' "> &nbsp;' + message + '</span> </div>'
            });
    } else {
        $ionicLoading.hide();
    }
}

function showCordovaLoading($cordovaSpinnerDialog, title, message, persistent, show)
{
    if (show) {
        $cordovaSpinnerDialog.show(title, message, persistent);
    } else
        $cordovaSpinnerDialog.hide();
}

function showIonicActionSheet($ionicActionSheet, buttons, titleText, destructiveText, destructiveButtonClicked, buttonClicked)
{
	var options = {};
	
	options.buttons = buttons;
	options.titleText = titleText;
	options.cancelText = "Cancel";
	options.buttonClicked = buttonClicked;
	
	if(destructiveText)
	{
		options.destructiveText = destructiveText;
		options.destructiveButtonClicked = destructiveButtonClicked;
	}
	
	var actionSheet = $ionicActionSheet.show(options);
}

function showCordovaActionSheet($cordovaActionSheet, buttons, titleText, destructiveText, destructiveButtonClicked, buttonClicked) {
    var options = {};

    options.buttonLabels = buttons;
    options.title = titleText;
    options.addCancelButtonWithLabel = "Cancel";
    options.androidEnableCancelButton = true;
    options.winphoneEnableCancelButton = true;

    if (destructiveText) {
        options.addDestructiveButtonWithLabel = destructiveText;
        options.destructiveButtonClicked = destructiveButtonClicked;
    }

    var actionSheet = $cordovaActionSheet.show(options, destructiveButtonClicked);

    actionSheet.then(buttonClicked);
}

function showCordovaDatePicker($cordovaDatePicker, field)
{
    var options = {
        mode: "date",
        minDate: new Date(),
        allowOldDates: false,
        allowFutureDates: true,
        doneButtonLabel: "Done",
        doneButtonColor: "#000",
        cancelButtonLabel: "Cancel",
        cancelButtonColor: "#FFF"
    }

    $cordovaDatePicker.show(options).then(function (date) {
        $(field).val(date);
    });
}

function showAdmobAd($cordovaAdMobPro, type)
{
    var options = {};

    if(ionic.Platform.isIOS)
    {
        options.banner = "ca-app-pub-8515121772651537/3148307842";
        options.interstitial = "ca-app-pub-8515121772651537/4625041042";
    } else
        if (ionic.Platform.isAndroid) {
            options.banner = "ca-app-pub-8515121772651537/7718108244";
            options.interstitial = "ca-app-pub-8515121772651537/9194841442";
        }

    //if(AdMob)
    if (type == "banner") {
        /*$cordovaAdMob.createBannerView(
        {
            "publisherId": options.banner,
            "position": 8,//AdMob.AD_POSITION_BOTTOM_CENTER,
            "autoShow": true,
            "isTesting": true
        }).then(function (data) {
            alert("done");
        });*/

        //if($cordovaAdMobPro)
        //  console.log("has admob pro");

        $cordovaAdMobPro.setOptions(
        {
            adId: options.banner,
            position: AdMob != null ? AdMob.AD_POSITION.BOTTOM_CENTER : 8,
            autoShow: true,
            isTesting: false,
            adSize: 'SMART_BANNER'
        });

        $cordovaAdMobPro.createBanner(options.banner);
    }
}

function handlePushNotifications($cordovaToast, $scope, notification, type, $rootScope)
{
    var message, data, notificationData;

    if(type == "ios")
    {
        data = notification;
    }else
        if(type == "android")
        {
            if(notification.collapse_key)
            {
                
            }

            data = notification.payload;
        }

    switch(data.type)
    {
        case "barbercancelledappointments":
            message = data.displayName + " cancelled their appointment for " + formatDate(data.appointmentDate);
            data.title = "Cancelled Appointment";
            break;
        case "usercancelledappointments":
            message = data.displayName + " cancelled your appointment for " + formatDate(data.appointmentDate);
            data.title = "Cancelled Appointment";
            break;
        case "barberdayofappointments":
            message = data.displayName + " has an upcoming appointment today at " + getReadableTime(splitDate(data.appointmentDate));
            data.title = "Upcoming Appointment";
            break;
        case "userdayofappointments":
            message = "You have an upcoming appointment today at " + getReadableTime(splitDate(data.appointmentDate)) + " with " + data.displayName;
            data.title = "Upcoming Appointment";
            break;
        case "barbernewappointment":
            message = data.displayName + " scheduled an appointment for " + formatDate(data.appointmentDate);
            data.title = "New Appointment";
            break;
        case "barberpreviousdayappointments":
            message = data.displayName + " has an appointment scheduled for tomorrow " + formatDate(data.appointmentDate);
            data.title = "Appointment Tomorrow";
            break;
        case "userpreviousdayappointments":
            message = " You have an appointment scheduled for tomorrow " + formatDate(data.appointmentDate) + " with " + data.displayName;
            data.title = "Appointment Tomorrow";
            break;
        case "barberpriorhourappointments":
            message = data.displayName + " has an upcoming appointment in one hour at " + getReadableTime(data.appointmentDate);
            data.title = "Upcoming Appointment";
            break;
        case "userpriorhourappointments":
            message = "You have an upcoming appointment in one hour at " + getReadableTime(data.appointmentDate) + " with " + data.displayName;
            data.title = "Upcoming Appointment";
            break;
        case "barbernewcustomer":
            message = data.displayName + " just became your customer ";
            data.title = "New Customer";
            break;
        case "barbershopnewimage":
            message = data.displayName + " barber shop has a new image in their gallery ";
            data.title = "New Barber Shop Image";
            break;
    }

    data.message = message;

    getNotificationData($scope);

    if ($scope.notificationInfo) {
        $scope.notificationInfo.push(data);
    } else
        $scope.notificationInfo = [data];

    setNotificationData($scope.notificationInfo);
    
    $cordovaToast.showLongTop(message);

    $rootScope.$broadcast("HasNotifications");
}

function getUserNotifications($scope, $ionicPopup)
{
    getNotificationData($scope);

    if($scope.notificationInfo)
    {
        /*$scope.notificationPopup = $ionicPopup.show({
            templateUrl: 'templates/notifications-popover.html',
            scope: $scope
        });
        
        $scope.notificationPopup.then(function (res) {
            clearNotificationData();

            $scope.hasNotifications = false;
        });

        $(".popup").css({
            // height: (screen.height / 2) + 'px',
            // width: '100%',
            position: "absolute",
            top: "10px",
            bottom: "5px",
            left: "5px",
            right: "5px"
        });*/
        $scope.hasNotifications = false;
    }
}

function getNotificationData($scope)
{
    if (localStorage["notificationInfo"])
        $scope.notificationInfo = JSON.parse(localStorage["notificationInfo"]);
}

function clearNotificationData()
{
    localStorage.removeItem("notificationInfo");
}

function getNavData($scope) {
    if (localStorage["navData"]) {
        if ($scope)
        {
            var data = JSON.parse(localStorage["navData"]);
            $scope.navData = data.pop();

            if (data.length > 0)
                localStorage["navData"] = JSON.stringify(data);
            else
                localStorage.removeItem("navData");
        }
        else
            return JSON.parse(localStorage["navData"]);
    }

    return null;
}

function setNavData(data)
{
    var navData = getNavData();

    if (navData)
        navData.push(data);
    else
        navData = [data];
    
    localStorage["navData"] = JSON.stringify(navData);
}

function setNotificationData(notificationInfo) {
    localStorage["notificationInfo"] = JSON.stringify(notificationInfo);
}

function calculateRating(rating, max)
{
	if(rating > 0)
		return ((rating / 100) * max).toFixed(0);
	
	return 0;
}

function calculateRatingCounts(count, total)
{
	if(parseInt(count) == 0)
		return "0";
	
	return ((parseInt(count) / total) * 100).toFixed(0) + "%";
}

function calculateRatingValue(rating)
{
	if(rating >= 0 && rating <= 20)
		return 1;
	else
		if(rating >= 21 && rating <= 40)
			return 2;
		else
			if(rating >= 41 && rating <= 60)
				return 3;
			else 
				if(rating >= 61 && rating <= 80)
					return 4;
				else
					if(rating >= 81 && rating <= 100)
						return 5;
}

function splitDate(date, dateOnly)
{
    /*if (dateOnly) {
        date = date.split(/[-]/);
        return new Date(date[0], date[1] - 1, date[2]);
    }*/
    try
    {
        var mom = moment(date, ["YYYY-MM-DD", "YYYY-MM-DD h:mm:ss a", "YYYY-MM-DD h:mm:ss.S a",
                                "YYYY-MM-DD h:mm:ss.S", "YYYY-MM-DD h:mm:ss",
                                "MMM DD YYYY", "MMM DD, YYYY h:mm:ss a",
                                "ddd MMM DD YYYY h:mm:ss "]), nd;

        if(mom)
            nd = mom.toDate();

        if(nd == null || nd === undefined || nd == NaN)
            if (date.indexOf("-") > -1) {
                date = date.split(/[- :]/);

                return new Date(date[0], date[1] - 1, date[2], date[3], date[4], date[5]);
            }

        return nd
    }catch(err)
    {
        if (date.indexOf("-") > -1)
            date = date.split(/[- :]/);

        return new Date(date[0], date[1] - 1, date[2], date[3], date[4], date[5]);
    }

}

function getPageView(oldPage, newPage, params, isBack)
{
	if(/*document.URL.indexOf("caller") > -1 &&*/ isBack)
	{
		/*var caller = document.URL.substring(document.URL.indexOf("caller"));
		
		caller = decodeURIComponent(caller).replace("\"", "").replace("\"", "").replace("caller=", "");*/
		
		window.location = getBackPage();//document.URL.substring(0, document.URL.indexOf("?")).replace(oldPage, caller);
	}else	
		{
			if(document.URL.indexOf("login") == -1)
				setBackPage(document.URL);
		
			if(document.URL.indexOf("?") > -1)
				window.location = document.URL.substring(0, document.URL.indexOf("?")).replace(oldPage, newPage + "?" + (params != null ? params : ""));
			else
				window.location = document.URL.replace(oldPage, newPage + "?" + (params != null ? params : ""));
		}
}

function createJavaDate(dateToConvert)
{
    return splitDate(dateToConvert).toUTCString()
}

function updateNavLeft(ngClick, child)
{
	$("#navLeft").attr("ng-click", ngClick);
	angular.forEach($("#navLeft").children(), function(child, key){
		$(child).remove();
	});
	$("#navLeft").text("");
	$("#navLeft").append(child);
}

function handleImages(images)
{
    var i = images; 
    angular.forEach(images, function (image, key) {
        image["imageSrc"] = IMAGE_ENDPOINT + image.fileLocation + image.fileName;
    });

    //angular.forEach(i, function (image, key) {
    //    image["imageSrc"] = IMAGE_ENDPOINT + image.fileLocation + image.fileName;

    //    images.push(image);
    //});

    //angular.forEach(i, function (image, key) {
    //    image["imageSrc"] = IMAGE_ENDPOINT + image.fileLocation + image.fileName;

    //    images.push(image);
    //});

    //angular.forEach(i, function (image, key) {
    //    image["imageSrc"] = IMAGE_ENDPOINT + image.fileLocation + image.fileName;

    //    images.push(image);
    //});


    //angular.forEach(i, function (image, key) {
    //    image["imageSrc"] = IMAGE_ENDPOINT + image.fileLocation + image.fileName;

    //    images.push(image);
    //});
}

function handleOpenURL(url)
{
    if (url) {
        if ((url).indexOf("mybarbershop://") === 0) {
            if ((url).indexOf("square_payment_complete")) {
                var callbackResponse = decodeURIComponent((url).split("data=")[1]);

                globalScope.handleSquarePayment(callbackResponse);
            }
        }
    }
}