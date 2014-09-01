var places = 'AIzaSyBRn4K1hSAsfob8cB064EQLpvk4M4l8x1Q';
var dataObjects;
var map;
var IMAGE_ENDPOINT = "http://108.51.137.155:8080/" 
var globalScope;

$(function(){
    $('.slimScrollIt').slimScroll({
        height: '100%'
    });
});

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
    if (Modernizr.indexeddb) {
        var db = indexedDB.open("mbs");

        db.onupgradeneeded = function () {
            var data = db.result;
            var store = data.createObjectStore("profile", { keyPath: "id" });
            store.createIndex("userid", "id", { unique: true });

            store.put({ id: 4 });
        };

        db.onsuccess = function () {
            data = db.result;
        };
    } else
        if (Modernizr.websqldatabase) {
            return openDatabase('profile', '1.0', 'Profile storage', 5 * 1024 * 1024, function (db) {
                db.changeVersion('', '1.0', function (t) {
                    t.executeSql('CREATE TABLE user (id, userid');
                }, error);
            });
        }
}

function checkUser()
{
    var userid = 0;

    if(Modernizr.indexeddb)
    {
        var request = indexedDB.open("mbs");

        request.onsuccess = function()
        {
            var tx = request.result.transaction("profile", "readonly");
            var store = tx.objectStore("profile");

            store.openCursor().onsuccess = function (event) {
                var cursor = event.target.result;

                if(cursor)
                {
                    userid = cursor.value.id;
                    cursor.continue();
                }
            };

            /*cursor.listen();

            var data = index.get("");

            data.onsuccess = function () {
                var matching = data.result;
                if(matching !== undefined)
                {

                }
            }*/
        }
    }else
        if(Modernizr.websqldatabase)
        {

        }

    return userid;
}

function saveUserData($scope) {
    var userid = 0;

    if (Modernizr.indexeddb) {
        var db = indexedDB.open("mbs");
        
        var data = db.result.transaction("profile", "readwrite");
        var store = data.objectStore("profile");

        store.put({ id: $scope.mbsProfileID });

        return true;
    } else
        if (Modernizr.websqldatabase) {

        }

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
    //localStorage["newUser"] = (($scope.newUser == null) ? false : $scope.newUser);
}

function setBarberData(barberInfo) {
    localStorage["barberInfo"] = JSON.stringify(barberInfo);
}

function setUserShop($scope)
{
    localStorage["userShop"] = $scope.userShop;
}



function getUserShop($scope) {
    $scope.userShop = localStorage["userShop"];
}

function logOut() {
    clearUserData();
}

function loadProfile(){	
	if(globalScope)
	{
		if(getAccountType(globalScope.mbsAccountType) == "Barber")
			getPageView("index.html", "barberprofile.html", "barberID=" + globalScope.currentBarber.barberID);
		else
			getPageView("index.html", "profile.html", "profileID=" + globalScope.mbsProfileID);
	}
}

function clearUserData() {
    localStorage.clear();

    //window.location = "http://localhost:8080/scout.me.out.spring.angular/login";
    getPageView("index.html", "auth/login.html", null);
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
    //$scope.newUser = (localStorage["newUser"] == "true");
}

function getBarberData($scope) {
    $scope.barberInfo = JSON.parse(localStorage["barberInfo"]);
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

function renderNearbyBarberShops(data, $scope) {
    if (data) {
        dataObjects = new Array();

        var container = $("<div/>").addClass("list-group ");

        angular.forEach(data, function (barberShop, key) {
            var shop = $("<div/>").addClass("list-group-item list-group-item-inverse").css("background-color", "#4b4d4e");

            var shopName = $("<label/>").text(barberShop.shopName).css("color", "white");
            var shopAddress = $("<label/>").text(barberShop.street).css("color", "white");
            var shopCityState = $("<label/>").text(barberShop.city + ", " + barberShop.state).css("color", "white");
            var defaultButton = $("<button/>").addClass("btn btn-inverse").text("Set as your shop").attr("value", barberShop.shopName).click(function () {          	
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
	            		
	            		postStatusMessageWithActions("Do you own this shop?", "info", {
	            			delete: {
	            				label: "Yes",
	            				action: function()
	            				{
	            					$scope.currentBarber.isOwner = true;
	            					$scope.updateBarberInfo();
	            				}
	            			},
	            			cancel: {
	            				label: "No",
	            				action: function()
	            				{
	            					$scope.currentBarber.isOwner = false;
	            					$scope.updateBarberInfo();
	            				}
	            			}
	            		});            		        		
	        		}else  
                        $scope.createBarberShopCustomer(selectedShop);
                }
            });

            var distance = $("<label/>").text("Distance: " + calculateDistance(38.643517, -77.260843, barberShop.latitude, barberShop.longitude, "M") +
                            " miles away").css("color", "white");

            shop.append(shopName)
                .append($("<br/>"))
                .append(shopAddress)
                .append($("<br/>"))
                .append(shopCityState)
                .append($("<i/>").addClass("fa fa-chevron-right pull-right").val("::before").css("color", "white"))
                .append($("<br/>"))
                .append(distance)
                .append($("<br/>"))
                .append(defaultButton);


            container.append(shop);

            dataObjects.push(barberShop);
        });

        $("#conDiv").append(container);
    }
}

function renderBarberShops(data, $scope)
{
    if(data)
    {
    	if(dataObjects == null)
    		dataObjects = new Array();

        var container = $("<div/>").addClass("list-group ");

        angular.forEach(data, function (barberShop, key) {
            var shop = $("<div/>").addClass("list-group-item list-group-item-inverse").css("background-color", "#4b4d4e");

            var shopName = $("<label/>").text(barberShop.name).css("color", "white");
            var shopAddress = $("<label/>").text(formatAddress(barberShop.formatted_address, "Street")).css("color", "white");
            var shopCityState = $("<label/>").text(formatAddress(barberShop.formatted_address, "CityState")).css("color", "white");
            var defaultButton = $("<button/>").addClass("btn btn-inverse").text("Set as your shop").attr("value", barberShop.name).click(function () {
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

                                $scope.createBarberShop(shop);
                            });

                        }  
                    });
                }
            });
            var distance = $("<label/>").text("Distance: " + calculateDistance(38.643517, -77.260843, barberShop.geometry.location.k, barberShop.geometry.location.A, "M") +
                            " miles away").css("color", "white");

            shop.append(shopName)
                .append($("<br/>"))
                .append(shopAddress)
                .append($("<br/>"))
                .append(shopCityState)
                .append($("<i/>").addClass("fa fa-chevron-right pull-right").val("::before").css("color", "white"))
                .append($("<br/>"))
                .append(distance)
                .append($("<br/>"))
                .append(defaultButton);
                

            container.append(shop);

            dataObjects.push(barberShop);
        });

        $("#conDiv").append(container);
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
                return format[2];
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
        currentBarber.barberShop = barber.barberShop;
        currentBarber.barberStatus = barber.barberStatus;
        currentBarber.rating = barber.rating;
        currentBarber.barberSchedule = barber.barberSchedule;
        currentBarber.barberSpecialties = barber.barberSpecialties;
        currentBarber.barberClients = barber.barberClients;
        currentBarber.barberImages = barber.barberImages;
        currentBarber.dateCreated = barber.dateCreated;

        $scope.currentBarber = currentBarber;
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
        currentProfile.dateCreated = profile.member.dateCreated;
        currentProfile.barberShop = profile.barberShop;
        currentProfile.images = profile.media;
        
        $scope.currentProfile = currentProfile;
    }
}

function buildBarberShop(barberShop, $scope)
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
            currentBarberShop.address = shop.address;
            currentBarberShop.barberShopSpecialties = shop.barberShopSpecialties;
            currentBarberShop.barbers = shop.barbers;
            currentBarberShop.images = shop.images;
            currentBarberShop.customers = shop.customers;

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
        currentBarberShop.address = barberShop.address;
        currentBarberShop.barberShopSpecialties = barberShop.barberShopSpecialties;
        currentBarberShop.barbers = barberShop.barbers;
        currentBarberShop.images = barberShop.images;
        currentBarberShop.customers = barberShop.customers;

        $scope.currentBarberShops.push(currentBarberShop);
    }
}

function buildAppointments(appointments, $scope) {
    if (appointments) {
        $scope.currentAppointments = new Array();

        angular.forEach(appointments, function (appointment, key) {
            var currentAppointment = new Object();

            currentAppointment.appointmentID = appointment.appointmentID;
            currentAppointment.barberID = appointment.barberID;
            currentAppointment.profileID = appointment.profileID;
            currentAppointment.wasCancelled = appointment.wasCancelled;
            currentAppointment.appointmentDate = appointment.appointmentDate;
            currentAppointment.appointmentStatus = appointment.appointmentStatus;
            if (appointment.barber)
                currentAppointment.barber = appointment.barber;
            else
                if (appointment.profile)
                    currentAppointment.profile = appointment.profile;

            $scope.currentAppointments.push(currentAppointment);
        });
    }
}

function renderUserAppointments($scope) {
    var container = $("<div/>").addClass("list-group ").css("background-color", "#4b4d4e").css("height", "50%");

    container.append($("<div/>").append(
                                        $("<label/>").text("Appointments  ")
                                        			 .append($("<span/>").addClass("badge").text($scope.currentAppointments != null ? $scope.currentAppointments.length : 0))
                                                     .css({ "color": "white", "padding-left": "5px" })
                                ).css("background-color", "#4b4d4e")
                      );

    $("#conDiv").empty();

    if ($scope.currentAppointments) {
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
        container.append($("<div/>").append($("<label/>").text("You have no appointments scheduled!")
                                                         .css({
                                                             "color": "white",
                                                             "padding-left": "5px",
                                                             "text-align": "center"
                                                         })
                                            ).append($("<hr/>"))
                                             .css("background-color", "#4b4d4e")
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

    if ($scope.currentBarberShops) {
        angular.forEach($scope.currentBarberShops, function (barberShop, key) {
            var shop = $("<div/>").addClass("list-group-item list-group-item-inverse").css("background-color", "#4b4d4e");

            var shopImage = $("<img/>").prop("src", getProfileImage(barberShop.image, "barberShop")).css("width", "70px").css("height", "100px");
            var shopName = $("<h4/>").addClass("media-heading").text(barberShop.shopName).css("color", "white");
            var shopAddress = $("<label/>").text(formatAddressReverse(barberShop.address, "Street")).css("color", "white");
            var shopCityState = $("<label/>").text(formatAddressReverse(barberShop.address, "CityState")).css("color", "white");
            var shopPhoneNumber = $("<label/>").text(barberShop.phoneNumber).css("color", "white");
            var defaultButton = $("<button/>").addClass("btn btn-inverse").text("View Shop").attr("value", barberShop.barberShopID).click(function()
            {
                window.location = document.URL.replace("index.html", "barbershop.html?barberShopID=" + $(this).val());
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
                                    .append($("<hr/>"))
                                    .css("background-color", "#4b4d4e")
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

function getHoursOfOperation(hoursOfOperation)
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

            angular.forEach(weekdays, function (day, key) {
                dayHours.append(
                    $("<label/>").text(day + ": " + (hours[day] == undefined ? "N/A" : hours[day]))
                                 .css({
                                     "color": "white",
                                     "padding-right": "5px"
                                })
                );
            });

            return $("<div/>").append(
                        $("<label/>").text("Today: " + (today != undefined ? today : "No hours posted")).css("color", "white")
                    ).append(dayHours);
        }catch(err)
        {
            return $("<div/>").append($("<label/>").text("No Hours of Operation posted").css("color", "white"));
        }
    }

    return $("<div/>").append($("<label/>").text("No Hours of Operation posted").css("color", "white"));
}

function getSpecialties(Specialties) {
    if (Specialties) {
        try
        {
            var con = $("<div/>");
            var i = 0;
            
            angular.forEach(Specialties, function (specialty, key) {
                con.append(
                    $("<label/>").text((i > 0 ? ", " : "") + specialty.specialty).css("color", "white")
                );

                i++;
            })
            
            return con;
        } catch (err) {
            return $("<div/>").append($("<label/>").text("No Specialties posted").css("color", "white"));
        }
    }

    return $("<div/>").append($("<label/>").text("No Specialties posted").css("color", "white"));
}

function renderBarbers(barbers) {
    if (barbers) {
        var container = $("<div/>").addClass("list-group ").css("height", "100px");

        angular.forEach(barbers, function (barber, key) {
            var shopBarber = $("<div/>").addClass("list-group-item list-group-item-inverse").css("background-color", "#4b4d4e");

            var barberImage = $("<img/>").prop("src", getProfileImage(barber.image, "barber")).css("width", "100px").css("height", "100px");
            var barberName = $("<h4/>").addClass("media-heading").text(/*"Name: " +*/ barber.profile.displayName).css("color", "white");
            var profileButton = getButton("View Profile").val(barber.barberID).css("padding-right", "15px").click(function(){
            	window.location = document.URL.substring(0, document.URL.indexOf("?")).replace("barbershop.html", "barber.html?barberID=" + $(this).val());
            });
            var apptButton = getButton("Make Appointment").val(barber.barberID).click(function() {
            	window.location = document.URL.substring(0, document.URL.indexOf("?")).replace("barbershop.html", "appointment.html?barberID=" + $(this).val());
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
                                                       .append(barber.acceptsAppointments == "true" ? apptButton : $("<div/>"))
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
    if (customers) {
        var container = $("<div/>").addClass("list-group ").css("width", "100%");

        angular.forEach(customers, function (customer, key) {
            var shopCustomer = $("<div/>").addClass("list-group-item list-group-item-inverse").css("background-color", "#4b4d4e");

            var customerImage = $("<img/>").prop("src", getProfileImage(customer.image, "profile")).css("width", "100px").css("height", "100px");
            var customerName = $("<h4/>").addClass("media-heading").text(customer.profile.displayName).css("color", "white");
            var dateCreated = new Date(Date.parse(customer.dateCreated));
            var profileButton = getButton("View Profile").val(customer.profile.profileID).click(function (){
            	getPageView("barbershop.html", "profile.html", "profileID=" + $(this).val());
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
    if (clients) {
        var container = $("<div/>").addClass("list-group ").css("width", "100%");

        angular.forEach(clients, function (client, key) {
            var barberClient = $("<div/>").addClass("list-group-item list-group-item-inverse").css("background-color", "#4b4d4e");

            var clientImage = $("<img/>").prop("src", getProfileImage(client.profile.image, "profile")).css("width", "100px").css("height", "100px");
            var clientName = $("<h4/>").addClass("media-heading").text(client.profile.displayName).css("color", "white");
            var dateCreated = new Date(Date.parse(client.dateCreated));
            var profileButton = getButton("View Profile").val(client.profile.profileID).click(function (){
            	getPageView("barber.html", "profile.html", "profileID=" + $(this).val());
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

function renderUserShops($scope) {
    var container = $("<div/>").addClass("list-group ").css("background-color", "#4b4d4e").css("height", "100px");

    /*container.append($("<div/>").append(
                                        $("<label/>").text($scope.currentProfile.displayName + " Barber Shops")
                                                     .css({ "color": "white", "padding-left": "5px" })
                                       ).css("background-color", "#4b4d4e")
                    );*/

    if ($scope.currentBarberShops) {
        angular.forEach($scope.currentBarberShops, function (barberShop, key) {
            var shop = $("<div/>").addClass("list-group-item list-group-item-inverse").css("background-color", "#4b4d4e");

            var shopImage = $("<img/>").prop("src", getProfileImage(barberShop.image, "barberShop")).css("width", "70px").css("height", "100px");
            var shopName = $("<h4/>").addClass("media-heading").text(barberShop.shopName).css("color", "white");
            var shopAddress = $("<label/>").text(formatAddressReverse(barberShop.address, "Street")).css("color", "white");
            var shopCityState = $("<label/>").text(formatAddressReverse(barberShop.address, "CityState")).css("color", "white");
            var shopPhoneNumber = $("<label/>").text(barberShop.phoneNumber).css("color", "white");
            var defaultButton = $("<button/>").addClass("btn btn-inverse").text("View Shop").attr("value", barberShop.barberShopID).click(function()
            {
                window.location = document.URL.replace("index.html", "barbershop.html?barberShopID=" + $(this).val());
                /*$location.path("/views/index.html%23/barbershop").search("barberShopID", $(this).val());
                alert($location.absUrl());*/
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
        	//IMAGE_ENDPOINT + 
        } else
            return "../img/" + (type == "barberShop" ? "barberShopPole.jpg" : "default_image.gif");
    }

    return "../img/default_image.gif";
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
        var newDate = new Date(Date.parse(date));
        var today = newDate.getDate() == new Date().getDate() && newDate.getFullYear() == new Date().getFullYear() && newDate.getMonth() == new Date().getMonth() ? true : false;

        return (today == true ? "Today " : getReadableDay(newDate.getDay()) + " ") + getReadableMonth(newDate.getMonth()) + " " + newDate.getDate() + ", " + newDate.getFullYear() + " at " + getReadableTime(newDate);
    }

    return date;
}

function formatDateNoTime(date) {
    if (date) {
        var newDate = new Date(Date.parse(date));
        var today = newDate.getDate() == new Date().getDate() && newDate.getFullYear() == new Date().getFullYear() && newDate.getMonth() == new Date().getMonth() ? true : false;

        return (today == true ? "Today " : getReadableDay(newDate.getDay()) + " ") + getReadableMonth(newDate.getMonth()) + " " + newDate.getDate() + ", " + newDate.getFullYear();
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
        case 1: return "December";
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

function scheduleAppointment(apptDate, apptTime)
{
	if(apptDate && apptTime)
	{
		apptDate = new Date(Date.parse(apptDate));		
		apptDate.setDate(apptDate.getDate() + 1);
		
		if(apptDate.getTime() >= new Date().getTime())
		{
			var hours = decodeTime(apptTime.trim());
			
			minutes = hours.toString().indexOf(".") > -1 ? 30 : 0;
			hours = hours.toString().indexOf(".") > -1 ? hours.toString().replace(".5", "") : hours;
			
			apptDate.setMinutes(minutes);
			apptDate.setHours(hours);		
			
			tScope.createAppointment(apptDate);
		}else
			postStatusMessage("Appointments can only be made for " + formatDateNoTime(new Date()) + " or later", "error");
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
		day.setDate(day.getDate() + 1);
		
		if($scope.currentBarber.barberStatus.vacationStartDate && $scope.currentBarber.barberStatus.vacationEndDate)
		{
			var endDate = new Date(Date.parse($scope.currentBarber.barberStatus.vacationEndDate));
			var isEndDay = false;
			
	   		if(day.getDate() == endDate.getDate() && day.getFullYear() == endDate.getFullYear() &&
   			   day.getMonth() == endDate.getMonth())
	   			isEndDay = true;
	   		
			if(day.getTime() >= Date.parse($scope.currentBarber.barberStatus.vacationStartDate) 
			   && day.getTime() <= Date.parse($scope.currentBarber.barberStatus.vacationEndDate)
			   || isEndDay)
				return true;
		}
	}	
	
	return false;
}

function getAvailableAppointmentTimes($scope, day, events, slider, calendar)
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
    	  
    	  slider.animate({height: "400px"}, "fast");
	   }else
		   if(hours == "OFF" || checkVacation(day, $scope))
		   {
			   slider.stop(false, true).slideToggle("fast");
			   calendar.activecell = 0;
		   }else
			   {
			   		getDefaultApptTimes($scope);
			   }
       
       if(events && events.length > 0)
	   {
    	   angular.forEach(events, function (event, key) {
    		   if(event.wasCancelled == "false")
    			   $scope.apptTimes[event.time] = null
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

function getPageView(oldPage, newPage, params)
{
	if(document.URL.indexOf("?") > -1)
		window.location = document.URL.substring(0, document.URL.indexOf("?")).replace(oldPage, newPage + "?" + (params != null ? params : ""));
	else
		window.location = document.URL.replace(oldPage, newPage + "?" + (params != null ? params : ""));
}

function createJavaDate(dateToConvert)
{
	return new Date(Date.parse(dateToConvert)).toUTCString()
}