const fetch = require("node-fetch");

// Mapquest API dashboard: https://developer.mapquest.com/user/me/apps
/*
Help4U’s Keys
Consumer Key	mwZodU08iNjRDmcuD2V3hw3zqVZ1cdTw
Key Issued	Sat, 03/21/2020 - 23:17
Key Expires	Never
*/

// Mapquest example to get directions: https://developer.mapquest.com/documentation/mapquest-js/v1.3/examples/basic-directions/
// Mapquest example for location: https://developer.mapquest.com/documentation/mapquest-js/v1.3/examples/geocoding-with-custom-popups/
// Mapquest example for full-address location: https://developer.mapquest.com/documentation/mapquest-js/v1.3/examples/geocoding-with-an-advanced-location-object/
// Note: for location we will probably need a combination of the two options above
//
// using try/catch in the calls to prevent unhandled exceptions: https://www.tutorialkart.com/nodejs/node-js-try-catch/

// Approach: 
// 1) create a JSON object that will hold all the javascript functions. A lot of content, but the idea is here: https://www.dofactory.com/tutorial/javascript-function-objects
// 2) define the type of requests the app will need to get from the maps API.  For example, validation of an address, route between two addresses to find distance, convert lat/long coordinates into an address, etc;
// 3) define the function paramters. It will take data to use in the API, and possibly a Callback.  In some cases, it will be important to return a promise and let the caller handle it. This will still work asynchornosly, but the caller can make the thread wait until the execution is completed
// 4) export the object, so it can be used by other components - like the Controller
// 5) make sure that the controller has a reference of this model, so it can call the functions it exposes

const mapQ = {
    getKey() {
        return "mwZodU08iNjRDmcuD2V3hw3zqVZ1cdTw";
    },
    getAddressFromCoordinates(latitude, longitude, cb) {
        // https://developer.mapquest.com/documentation/geocoding-api/reverse/get/
        // http://www.mapquestapi.com/geocoding/v1/reverse?key=KEY&location=30.333472,-81.470448&includeRoadMetadata=true&includeNearestIntersection=true
        fetch('http://www.mapquestapi.com/geocoding/v1/reverse?key=' + this.getKey() + '&location=' + latitude + ',' + longitude)
            .then(function (response) {
                return response.json();
            })
            .then((mapInfo) => {
                var address = "error";
                try {
                    var location = mapInfo.results[0].locations[0];
                    console.log(location);
                    if (location.street && location.adminArea5 && location.adminArea3 && location.postalCode) {
                        address = location.street + ", " + location.adminArea5 + " " + location.adminArea3 + ", " + location.postalCode;
                        console.log(address);
                    }
                }
                catch (error) {
                    console.log("error: " + error);
                }

                return address;
            })
            .then((result) => {
                cb(result);
            });

    },
    validateAddress(address, cb) {
        // https://developer.mapquest.com/documentation/geocoding-api/address/get/
        // http://www.mapquestapi.com/geocoding/v1/address?key=KEY&location=Washington,DC
        fetch('http://www.mapquestapi.com/geocoding/v1/address?key=' + this.getKey() + '&location=' + address)
            .then(function (response) {
                return response.json();
            })
            .then((mapInfo) => {
                var address = "error";
                try {
                    var location = mapInfo.results[0].locations[0];
                    console.log("validateAddress: " + location);
                    if (location.street && location.adminArea5 && location.adminArea3 && location.postalCode) {
                        address = location.street + ", " + location.adminArea5 + " " + location.adminArea3 + ", " + location.postalCode;
                        console.log(address);
                        console.log("validateAddress: " + address);
                    }
                }
                catch (error) {
                    console.log("error: " + error);
                }

                return address;
            })
            .then((result) => {
                console.log("validateAddress(callback): " + result);
                cb(result);
            });
    },
    validateAddressAsync(address) {
        // This is async because it will return a promise to the caller (fetch returns a promise). 
        // If the caller wants this to be synchronous, it is just
        // required to add "await" -> https://javascript.info/async-await
        // https://developer.mapquest.com/documentation/geocoding-api/address/get/
        // http://www.mapquestapi.com/geocoding/v1/address?key=KEY&location=Washington,DC
        let p = fetch('http://www.mapquestapi.com/geocoding/v1/address?key=' + this.getKey() + '&location=' + address)
            .then(function (response) {
                return response.json();
            })
            .then((mapInfo) => {
                var address = "error";
                try {
                    var location = mapInfo.results[0].locations[0];
                    console.log("validateAddress: " + location);
                    if (location.street && location.adminArea5 && location.adminArea3 && location.postalCode) {
                        address = location.street + ", " + location.adminArea5 + " " + location.adminArea3 + ", " + location.postalCode;
                        console.log(address);
                        console.log("validateAddress: " + address);
                    }
                }
                catch (error) {
                    console.log("error: " + error);
                }

                return address;
            })
            .then((result) => {
                console.log("validateAddress(callback): " + result);
                return result;
            });

        return p;
    },
    getRouteAsync(fromAddress, toAddress) {
        // https://developer.mapquest.com/documentation/directions-api/route/get/
        // http://www.mapquestapi.com/directions/v2/route?key=KEY&from=Clarendon Blvd,Arlington,VA&to=2400+S+Glebe+Rd,+Arlington,+VA
        let p = fetch('http://www.mapquestapi.com/directions/v2/route?key=' + this.getKey() + '&from=' + encodeURI(fromAddress) + "&to=" + encodeURI(toAddress))
            .then(function (response) {
                return response.json();
            })
            .then((mapInfo) => {
                var route = "error";
                try {
                    route = mapInfo.route;
                }
                catch (error) {
                    console.log("error: " + error);
                }

                return route;
            })
            .then((result) => {
                console.log("getRoute(callback): " + result);
                return result;
            });

        return p;
    }
};

// Export the database and API functions for the controller.
module.exports = mapQ;
