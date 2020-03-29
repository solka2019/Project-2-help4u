// Using express, per project requirements
let path = require("path");
var express = require("express");
let exphbs = require("express-handlebars");
var fetch = require("node-fetch");

var router = express.Router();

// Import the modelsto use its database functions.
var taskModel = require("../models/task");
var personModel = require("../models/person");
var mapsModel = require("../models/maps");


// Create all our routes and set up logic within those routes where required.
router.get("/", function (req, res) {
  res.render("index");
});


// Export routes for server.js to use.
module.exports = router;
