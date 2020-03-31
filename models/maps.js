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
const mapQ = {
    getKey() {
        return "mwZodU08iNjRDmcuD2V3hw3zqVZ1cdTw";
    },
    getAddressFromCoordinates(latitude, longitude, cb) {
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
};

// Export the database and API functions for the controller.
module.exports = mapQ;
