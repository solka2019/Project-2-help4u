// Import the ORM to create functions that will interact with the database.
var orm = require("../config/orm");

var task = {
  all: function (cb) {
    orm.all("tasks_v_persons", function (res) {
      cb(res);
    });
  },
  //https://www.mysqltutorial.org/mysql-nodejs/call-stored-procedures/
  getTasksByEmail: function (profileEmail, cb) {
    var queryString = "CALL getTasksByEmail(" + profileEmail + ");";
    orm.procedure(queryString, function (res) {
      cb(res);
    })
  },
  allHelp: function (cb) {
    orm.allBy("tasks_v_persons", "type_id=2 ORDER BY date_created DSC LIMIT 1000",
      function (res) {
        cb(res);
      })
  },
  allInNeed: function (cb) {
    orm.allBy("tasks_v_persons", "type_id=1 ORDER BY date_created DSC LIMIT 1000",
      function (res) {
        cb(res);
      })
  },
  myNeeds: function (profileEmail, cb) {
    orm.allBy("tasks_v_persons",
      "person_need_email=" + profileEmail +
      " AND type_id=1 ORDER BY date_created DSC",
      function (res) {
        cb(res);
      })
  },
  myHelps: function (profileEmail, cb) {
    orm.allBy("tasks_v_persons",
      "person_help_email=" + profileEmail +
      " AND type_id=2 ORDER BY date_created DSC",
      function (res) {
        cb(res);
      })
  },
  createNewNeed: function (personInNeedId, taskText, location1, location2, cb) {
    var cols = ["task_text", "task_type_id", "person_1_id", "location_start", "location_end", "status_id", "date_created"];
    var vals = [];
    vals.push(taskText);
    vals.push(1); // need type
    vals.push(personInNeedId);
    vals.push(location1);
    vals.push(location2);
    vals.push(2);
    vals.push(new Date().toDateString); // date and time
    this.create(cols, vals, cb); // calls the generic function in this object (see below)
  },
  createNewHelp: function (personCanHelpId, taskText, location1, location2, cb) {
    var cols = ["task_text", "task_type_id", "person_1_id", "location_start", "location_end", "status_id", "date_created"];
    var vals = [];
    vals.push(taskText);
    vals.push(2); // can help type
    vals.push(personCanHelpId);
    vals.push(location1);
    vals.push(location2);
    vals.push(2);
    vals.push(new Date().toDateString); // date and time
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

  approvePersonToHelpInTask: function (taskId) {
    var colsVars = { status_id: 4 }; // go to approved state
    var condition = "id = " + taskId + " AND status_id < 4";
    orm.update("task", colsVars, condition, function (res) {
      cb(res);
    });
  },
  disapprovePersonToHelpInTask: function (taskId) {
    var colsVars = { status_id: 2 }; // go back to waiting state
    var condition = "id = " + taskId; // the person in need can remove the helper at anytime
    orm.update("task", colsVars, condition, function (res) {
      cb(res);
    });
  },
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