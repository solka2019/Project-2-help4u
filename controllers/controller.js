// Using express, per project requirements
const path = require("path");
const express = require("express");
const exphbs = require("express-handlebars");
const fetch = require("node-fetch");
const util = require("util");

const router = express.Router();

// Import the models to use its database functions.
const taskModel = require("../models/task");
const personModel = require("../models/person");
const mapsModel = require("../models/maps");

// promisfy async conversions
// const getAllNeedsAsync = util.promisify(taskModel.allInNeed);
// const getRoutAsync = util.promisify(mapsModel.getRoute);
// const getUserLocationFromIdAsync = util.promisify(personModel.getLocationFromId);

// Create all our routes and set up logic within those routes where required.
let rootPaths = ['/'];
router.get(rootPaths, (req, res) => {
  console.log('got to the router and will try to render the landing page');
  console.log(req.query);
  console.log(req.params);
  let id = null;
  if (req.query) {
    id = req.query.userId;
  }

  res.render('index', {
    title: 'Home page',
    name: 'Connecting People',
    currentUserId: id
  });
});

let needHelpPaths = ['/need-help'];
router.get(needHelpPaths, (req, res) => {
  console.log('got to the router and will try to render the needHelp page');
  console.log(req.query);
  console.log(req.params);
  let id = null;
  if (req.query) {
    id = req.query.userId;
  }
  res.render('need-help', {
    title: 'I need help',
    name: 'Connecting People',
    currentUserId: id
  });
});


let canHelpPaths = ['/can-help']
router.get(canHelpPaths, async (req, res) => {
  console.log('got the router and will try to render the canhelp page');
  console.log(req.query);
  console.log(req.params);

  let id = null;
  let dataSet = [];
  if (req.query) {
    id = req.query.userId;
    location = await personModel.getLocationFromIdAsync(id);
    if (location.indexOf("error") == -1) {
      dataset = await taskModel.allInNeedCloseToLocation(location[0].profile_location)
    }
  }

  res.render('can-help', {
    title: 'I can help',
    name: 'Connecting People',
    tasks: dataset,
    currentUserId: id
  });
});


let helpBasketPaths = ['/help-basket'];
router.get(helpBasketPaths, (req, res) => {
  // Check if the user Id was provided, if not, we can't get their info
  console.log('got the router and will try to render the get basket page');
  console.log(req.query);
  console.log(req.params);

  let id = null;
  if (req.query) {
    id = req.query.userId;
  }

  console.log(id);

  if (!id || isNaN(id)) {
    console.log("normal path")
    res.render("help-basket", {
      title: 'Connecting People',
    })
  }
  else {
    console.log('get tasks path');
    taskModel.getTasksByUserId(id, (data) => {

      let dataSet = []
      if (data != null && data.length > 0 && data[0] != null) {
        dataSet = data[0];
      }

      res.render("help-basket", {
        title: 'Connecting People',
        tasks: dataSet,
        currentUserId: id
      });
    });
  }
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
    //res.send(JSON.stringify(userInfo));
    res.json(userInfo);

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
    //res.send(JSON.stringify({ taskId: data.insertId }));
    res.json({ taskId: data.insertId });
  });
});

router.post("/api/validateaddress", async function (req, res) {
  console.log('got the post for a map validation of an address');

  let dataFromMapAPI = await mapsModel.validateAddressAsync(req.body.location);

  res.json({ location: dataFromMapAPI });

});


router.post("/api/approvepersontohelp", (req, res) => {
  console.log('got the post for an approval to help');
  let userId = req.body.currentUserId;
  let personToHelpId = req.body.personToHelpId;
  let id = req.body.taskId;

  taskModel.approvePersonToHelp(id, userId, personToHelpId, (result) => {
    console.log(result);
    confirmedTaskId = id;
    //res.send(JSON.stringify({ taskId: confirmedTaskId }));
    res.json({ taskId: confirmedTaskId });
  });
});


router.post("/api/disapprovepersontohelp", (req, res) => {
  console.log('got the post for an approval to help');
  let userId = req.body.currentUserId;
  let personId = req.body.personId;
  let id = req.body.taskId;

  taskModel.disapprovePersonToHelp(id, userId, personId, (result) => {
    console.log(result);
    confirmedTaskId = id;
    res.send(JSON.stringify({ taskId: confirmedTaskId }));
    res.json({ taskId: confirmedTaskId });
  });
});

router.post("/api/cancelTask", (req, res) => {
  console.log('got the post for an approval to help');
  let id = req.body.taskId;

  taskModel.removeNeedOrHelpTask(taskId, true, (result) => {
    console.log(result);
    confirmedTaskId = id;
    //res.send(JSON.stringify({ taskId: confirmedTaskId }));
    res.json({ taskId: confirmedTaskId });
  });

  router.post("/api/allinneedclosetome", (req, res) => {
    console.log('got the post for all in need close to me');
    let userLocation = req.body.address
  })
});

router.post("/api/completeTask", (req, res) => {
  console.log('got the post for an approval to help');
  let id = req.body.taskId;

  taskModel.removeNeedOrHelpTask(taskId, false, (result) => {
    console.log(result);
    confirmedTaskId = id;
    // res.send(JSON.stringify({ taskId: confirmedTaskId }));
    res.json({ taskId: confirmedTaskId });
  });
});


// Export routes for server.js to use.
module.exports = router;
