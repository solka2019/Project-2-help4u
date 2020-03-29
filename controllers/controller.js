// Using express, per project requirements
const path = require("path");
const express = require("express");
const exphbs = require("express-handlebars");
const fetch = require("node-fetch");

const router = express.Router();

// Import the modelsto use its database functions.
const taskModel = require("../models/task");
const personModel = require("../models/person");
const mapsModel = require("../models/maps");

// Create all our routes and set up logic within those routes where required.
router.get("/", (req, res) => {
  res.render('index', {
    title: 'Home page',
    name: 'Connecting People'
  });
});

router.get("/need-help", (req, res) => {
  console.log('got to the router and will try to render the needHelp page');
  res.render('need-help', {
    title: 'I need help',
    name: 'Connecting People'
  });
});

router.get("/can-help", (req, res) => {
  console.log('got the router and will try to render the canhelp page');
  res.render('can-help', {
    title: 'I can help',
    name: 'Connecting People'
  });
});

router.get("/help-basket", (req, res) => {
  console.log('got the router and will try to render the get basket page');
  taskModel.getTasksByEmail('marfkar@gmail.com', (data) => {
    console.log(data);
    res.render("help-basket", {
      title: 'Connecting People',
      tasks: data,
    });
  });
});

// Export routes for server.js to use.
module.exports = router;
