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
  res.render("index", {
    title : "Home page",
    name: "Connecting People"
  });
});

router.get("/need-help", function(req, res){
  console.log("got to the router and will try to render the needHelp page");
  res.render("need-help", {
    title : "I need help"
  });
})

router.get("/can-help", function(req, res){
  console.log("got the router and will try to render the canhelp page");
  res.render("can-help", {
    title: "I can help"
  });
})

router.get("/help-basket", function(req, res){
  console.log("got the router and will try to render the get basket page");
  taskModel.getTasksByEmail("marfkar@gmail.com", function(data){
    console.log(data);
    res.render("help-basket", {
      title: "My help basket",
      tasks: data
    });
  })
  
})

// Export routes for server.js to use.
module.exports = router;
