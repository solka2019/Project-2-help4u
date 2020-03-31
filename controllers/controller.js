// Using express, per project requirements
const path = require("path");
const express = require("express");
const exphbs = require("express-handlebars");
const fetch = require("node-fetch");


const router = express.Router();

// Import the models to use its database functions.
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

router.post("/api/createuser", (req, res) => {
  console.log("got a request to create a new user")
  console.log(req.body);

  // Client-side object to hold the user information
  // let currentUser = {
  //   id: -1,
  //   name: "",
  //   email: "",
  //   latitude: "",
  //   longitude: "",
  //   address: "",
  //   locationSupport: false,
  //   loggedIn: false,
  // };

  personModel.create(req.body.email, req.body.name, req.body.address, (data) => {
    console.log(data);

    let id = -1;
    if (!data.insertId) {
      // not inserted because there was already a user that matches this email
      // get from the data returned, which is the full datarow from the table
      id = data.id;
    }
    else {
      // insert brand new, so the response will have this field
      id = data.insertId;
    }

    let userInfo = { userId: id };
    res.send(JSON.stringify(userInfo));
    
  });

});

router.post("/api/addneed", (req, res) => {
  console.log('got the post for a map validation of an address');

  // const newNeed = {
  //   task_text: needText,
  //   task_type_id: 1,
  //   person_id: currentUser.id,
  //   location_start: needAddress1,
  //   location_end: needAddress2
  // };

  taskModel.createNewTask(true, req.body.person_id, req.body.task_text, req.body.location_start, req.body.location_end, (data) => {
    console.log(data);
    res.send(JSON.stringify({ taskId: data.insertId }));
  });
});

router.post("/api/validateaddress", (req, res) => {
  console.log('got the post for a map validation of an address');

  mapsModel.validateAddress(req.body.location, (dataFromMapAPI) => {
    console.log("got this back from the map:" + dataFromMapAPI);
    // the res.send will send the data back to the client/browser
    res.send(JSON.stringify({ location: dataFromMapAPI }));
  })
});

// Export routes for server.js to use.
module.exports = router;
