var fetch = require("node-fetch");

// using try/catch in the calls to prevent unhandled exceptions: https://www.tutorialkart.com/nodejs/node-js-try-catch/
var mapQ = {
    getKey: function () {
        return 'mwZodU08iNjRDmcuD2V3hw3zqVZ1cdTw';
    },
    getAddressFromCoordinates: function (latitude, longitude, cb) {
        // http://www.mapquestapi.com/geocoding/v1/reverse?key=KEY&location=30.333472,-81.470448&includeRoadMetadata=true&includeNearestIntersection=true
        fetch("http://www.mapquestapi.com/geocoding/v1/reverse?key="+ this.getKey() + "&location=" + latitude + "," + longitude)
            .then(function (response) {
                return response.json();
            })
            .then(function (mapInfo) {
                var address = "error";
                try {
                    var location = mapInfo.results[0].locations[0];
                    address = location.street + ", " + location.adminArea4 + " " + location.adminArea3 + ", " + location.postalCode;
                    console.log(address);
                    return address;
                }
                catch{
                    return address;
                }
            });
    }
};

// Export the database and API functions for the controller.
module.exports = mapQ;