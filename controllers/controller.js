// Using express, per project requirements
var express = require("express");
var router = express.Router();

// Import the model (cat.js) to use its database functions.
var taskModel = require("../models/task");


// TODO: need to add the connection with Mapquest (3rd party API) to get the locations and directions
// Mapquest API dashboard: https://developer.mapquest.com/user/me/apps
/*
Help4U’s Keys
Consumer Key	mwZodU08iNjRDmcuD2V3hw3zqVZ1cdTw
Consumer Secret	l9VJJup0UUHDToNn
Key Issued	Sat, 03/21/2020 - 23:17
Key Expires	Never
*/

// Mapquest example to get directions: https://developer.mapquest.com/documentation/mapquest-js/v1.3/examples/basic-directions/
// Mapquest example for location: https://developer.mapquest.com/documentation/mapquest-js/v1.3/examples/geocoding-with-custom-popups/
// Mapquest example for full-address location: https://developer.mapquest.com/documentation/mapquest-js/v1.3/examples/geocoding-with-an-advanced-location-object/
// Note: for location we will probably need a combination of the two options above



// Create all our routes and set up logic within those routes where required.
router.get("/", function(req, res) {
  taskModel.all(function(data) {
    var hbsObject = {
      taskdb: data
    };
    console.log(hbsObject);
    res.render("index", hbsObject);
  });
});

router.post("/api/burgers", function(req, res) {

  taskModel.create([
    "burger_name", "devoured"
  ], [
    req.body.name, req.body.devoured
  ], function(result) {
    // Send back the ID of the new quote
    res.json({ id: result.insertId });
  });
});

router.put("/api/burgers/:id", function(req, res) {
  var condition = "id = " + req.params.id;

  // console.log("condition", condition);

  taskModel.update({
    devoured: req.body.devoured
  }, condition, function(result) {
    if (result.changedRows == 0) {
      // If no rows were changed, then the ID must not exist, so 404
      return res.status(404).end();
    } else {
      res.status(200).end();
    }
  });
});

router.delete("/api/burgers/:id", function(req, res) {
  var condition = "id = " + req.params.id;

  taskModel.delete(condition, function(result) {
    if (result.affectedRows == 0) {
      // If no rows were changed, then the ID must not exist, so 404
      return res.status(404).end();
    } else {
      res.status(200).end();
    }
  });
});

// Export routes for server.js to use.
module.exports = router;
