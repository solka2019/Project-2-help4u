// Import the ORM to create functions that will interact with the database.
var orm = require("../config/orm");

var task = {
  all: function (cb) {
    orm.all("tasks_v_persons", function (res) {
      cb(res);
    });
  },
  allByPerson: function (profileEmail, cb) {
    // need to create a query that can check either if the email provided is a person in need, or someone that can help, and order by the task type
    orm.allBy("tasks_v_persons",
      "person_need_email=" + profileEmail +
      " OR person_help_email=" + profileEmail +
      " ORDER BY type_id ASC",
      function (res) {
        cb(res);
      })
  },
  allHelp: function (cb) {
    orm.allBy("tasks_v_persons", "type_id=2 ORDER BY date_created DSC",
      function (res) {
        cb(res);
      })
  },
  allInNeed: function (cb) {
    orm.allBy("tasks_v_persons", "type_id=1 ORDER BY date_created DSC",
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
  createNewNeed: function (personInNeedId, taskText, location, cb) {

  },
  createMewHelp: function (personCanHelpId, taskText, location, cb) {

  },
  approvePersonToHelp: function (personInNeedId, taskId) {
    // I can only approve my own needs and if the task exists and is in "Selected" status!
    // This means that someone chose to help, and I validated the person should be able to see location information

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