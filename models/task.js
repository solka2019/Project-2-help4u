// Import the ORM to create functions that will interact with the database.
var orm = require("../config/orm");

var task = {
  getCurrentTime: function () {
    var m = new Date();
    var dateString = m.getUTCFullYear() + "/" + (m.getUTCMonth() + 1) + "/" + m.getUTCDate() + " " + m.getUTCHours() + ":" + m.getUTCMinutes() + ":" + m.getUTCSeconds();
    return dateString;
  },
  all: function (cb) {
    orm.all("tasks_v_persons", function (res) {
      cb(res);
    });
  },
  //https://www.mysqltutorial.org/mysql-nodejs/call-stored-procedures/
  getTasksByEmail: function (profileEmail, cb) {
    var queryString = "CALL `getTasksByEmail`(\"" + profileEmail + "\");";
    console.log(queryString); orm.procedure(queryString, function (res) {
      cb(res);
    })
  },
  allHelp: function (cb) {
    orm.allBy("tasks_v_persons", "type_id=2 ORDER BY date_created DESC LIMIT 1000",
      function (res) {
        cb(res);
      })
  },
  allInNeed: function (cb) {
    orm.allBy("tasks_v_persons", "type_id=1 ORDER BY date_created DESC LIMIT 1000",
      function (res) {
        cb(res);
      })
  },
  myNeeds: function (profileEmail, cb) {
    orm.allBy("tasks_v_persons",
      "person_need_email=" + profileEmail +
      " AND type_id=1 ORDER BY date_created DESC",
      function (res) {
        cb(res);
      })
  },
  myHelps: function (profileEmail, cb) {
    orm.allBy("tasks_v_persons",
      "person_help_email=" + profileEmail +
      " AND type_id=2 ORDER BY date_created DESC",
      function (res) {
        cb(res);
      })
  },
  createNewTask: function (isNeed, personId, taskText, location1, location2, cb) {
    var cols = ["task_text", "task_type_id", "person_1_id", "location_start", "location_end", "status_id", "date_created"];
    var vals = [];
    if (!location1) {
      location1 = '';
    }
    if (!location2) {
      location2 = '';
    }

    //task_text
    vals.push(taskText);

    //task_type_id
    if (isNeed) {
      vals.push(1) // need type
    } else {
      vals.push(2); // can help type
    }

    //person_1_id
    vals.push(personId);
    //location_start
    vals.push(location1);
    //location_end
    vals.push(location2);
    //status_id
    vals.push(2);
    //date_created
    var now = this.getCurrentTime();
    vals.push(now); // date and time

    this.create(cols, vals, cb); // calls the generic function in this object (see below)
  },
  removeNeedOrHelpTask: function (taskId, isAbandoned, cb) {
    var colsVars;
    var condition;
    if (isAbandoned) {
      colsVars = { status_id: 7 }; // Abandoned state
      condition = "id = " + taskId;
    }
    else {
      colsVars = { status_id: 6 }; // Completed state
      condition = "id = " + taskId + " AND status_id > 4";
    }

    orm.update("task", colsVars, condition, function (res) {
      cb(res);
    });
  },

  // The following APIs exposed are very important - specially "acceptTohelpInTask" because
  // multiple people might try to accept a single person in need, which means we should use
  // the conditions to make sure we are not overriding the requests from other people that
  // could have happen in the server while the page of a user shows older data.
  acceptToHelpInTask: function (taskId, personCanHelpId, cb) {
    var colsVars;
    var condition;
    colsVars = { "person_2_id": personCanHelpId, "status_id": 3 };
    condition = "id = " + taskId + " AND status_id = 2"
  },
  approvePersonToHelpInTask: function (taskId, personCanHelpId) {
    var colsVars = { status_id: 4 }; // go to approved state
    var condition = "id = " + taskId + " AND status_id < 4 AND person_2_id = " + personCanHelpId;
    orm.update("task", colsVars, condition, function (res) {
      cb(res);
    });
  },
  disapprovePersonToHelpInTask: function (taskId, personCanHelpIdNotApproved) {
    var colsVars = { "person_2_id": null, "status_id": 2 }; // go back to waiting state
    var condition = "id = " + taskId + " AND status_id < 4 AND person_2_id = " + personCanHelpIdNotApproved; // the person in need can remove the helper at anytime
    orm.update("task", colsVars, condition, function (res) {
      cb(res);
    });
  },
  // Shouldn't use the other functions because they are too generic
  // The variables cols and vals are arrays.
  create: function (cols, vals, cb) {
    orm.create("task", cols, vals, function (res) {
      cb(res);
    });
  },
  update: function (objColVals, condition, cb) {
    orm.update("task", objColVals, condition, function (res) {
      cb(res);
    });
  },
  delete: function (condition, cb) {
    orm.delete("task", condition, function (res) {
      cb(res);
    });
  }
};

// Export the database and API functions for the controller.
module.exports = task;