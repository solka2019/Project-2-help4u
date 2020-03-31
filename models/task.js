// Import the ORM to create functions that will interact with the database.
const orm = require("../config/orm");
const personModel = require("./person");
const mapModel = require("./maps");


const task = {
  all(cb) {
    orm.all('tasks_v_persons', (res) => {
      cb(res);
    });
  },
  getTasksByUserId(currentUserId, cb) {
    // get the email from the userId
    personModel.getEmailFromId(currentUserId, (res) => {
      if (res && res[0] && res[0].profile_email) {
        let email = res[0].profile_email;
        this.getTasksByEmail(email, cb);
      }
      else {
        cb(res);
      }
    });
  },
  // https://www.mysqltutorial.org/mysql-nodejs/call-stored-procedures/
  getTasksByEmail(profileEmail, cb) {
    const queryString = `CALL \`getTasksByEmail\`("${profileEmail}");`;
    console.log(queryString);
    orm.procedure(queryString, (res) => {
      cb(res);
    });
  },
  allHelp(cb) {
    orm.allBy(
      'tasks_v_persons',
      'type_id=2 ORDER BY date_created DESC LIMIT 1000',
      (res) => {
        cb(res);
      },
    );
  },
  allInNeedExceptMe(userId, cb) {
    let condition = ' type_id=1 AND person_1_id != ' + userId + ' AND status_id < 3 ORDER BY date_created DESC LIMIT 100';
    orm.allBy(
      'tasks_v_persons',
      condition,
      (res) => {
        cb(res);
      },
    );
  },
  allInNeedExeceptMeAsync: async function (userId) {
    return new Promise((resolve, reject) => {
      this.allInNeedExceptMe(userId, (result) => {
        resolve(result);
      });
    });
  },
  allInNeedCloseToLocation: async function (id, location, cb) {

    let needsResult = await this.allInNeedExeceptMeAsync(id);

    if (needsResult != null && needsResult.length > 0 ) {
      // loop through the needs and using the location plus the address in the need, check the distance with mapquest
      for (let idx = 0; idx < needsResult.length; ++idx) {
        let location1 = needsResult[idx].location_start;
        if (location1 != null && location1 != '') {
          // get the distance from mapquest
          let route = await mapModel.getRouteAsync(location, location1);
          needsResult[idx].distance = route.distance;
        }
      }

      // order by distance https://stackoverflow.com/questions/979256/sorting-an-array-of-objects-by-property-values

      needsResult.sort(function (a, b) {
        return parseFloat(a.distance) - parseFloat(b.distance);
      });
    }

    return needsResult;
  },
  myNeeds(profileEmail, cb) {
    orm.allBy(
      "tasks_v_persons",
      'person_need_email=' +
      profileEmail
      + " AND type_id=1 ORDER BY date_created DESC",
      (res) => {
        cb(res);
      },
    );
  },
  myHelps(profileEmail, cb) {
    orm.allBy(
      "tasks_v_persons",
      'person_help_email=' +
      profileEmail
      + " AND type_id=2 ORDER BY date_created DESC",
      (res) => {
        cb(res);
      },
    );
  },
  createNewTask(isNeed, personId, taskText, location1, location2, cb) {
    const cols = [
      'task_text',
      'task_type_id',
      'person_1_id',
      'location_start',
      'location_end',
      'status_id',
      'date_created',
    ];
    const vals = [];
    if (!location1) {
      location1 = "";
    }
    if (!location2) {
      location2 = "";
    }

    // task_text
    vals.push(taskText);

    // task_type_id
    if (isNeed) {
      vals.push(1); // need type
    } else {
      vals.push(2); // can help type
    }

    // person_1_id
    vals.push(personId);
    // location_start
    vals.push(location1);
    // location_end
    vals.push(location2);
    // status_id
    vals.push(2);
    // date_created
    //https://stackoverflow.com/questions/5129624/convert-js-date-time-to-mysql-datetime
    vals.push(new Date().toISOString().slice(0, 19).replace('T', ' '));

    this.create(cols, vals, cb); // calls the generic function in this object (see below)
  },
  removeNeedOrHelpTask(taskId, isAbandoned, cb) {
    let colsVars;
    let condition;
    if (isAbandoned) {
      colsVars = { status_id: 7 }; // Abandoned state
      condition = 'id = ' + taskId;
    } else {
      colsVars = { status_id: 6 }; // Completed state
      condition = 'id = ' + taskId + ' AND status_id > 4';
    }

    orm.update('task', colsVars, condition, (res) => {
      cb(res);
    });
  },

  // The following APIs exposed are very important - specially "acceptTohelpIn" because
  // multiple people might try to accept a single person in need, which means we should use
  // the conditions to make sure we are not overriding the requests from other people that
  // could have happen in the server while the page of a user shows older data.
  offerToHelp(taskId, personCanHelpId, cb) {
    let colsVars;
    let condition;
    colsVars = { person_2_id: personCanHelpId, status_id: 3 };
    condition = 'id = ' + taskId + ' AND status_id < 3';
    orm.update('task', colsVars, condition, (res) => {
      cb(res);
    });
  },
  approvePersonToHelp: function (taskId, taskOwnerId, personCanHelpId, cb) {
    var colsVars = { status_id: 4 }; // go to approved state
    var condition = 'id = ' + taskId + ' person_1_id = ' + taskOwnerId + ' AND status_id < 4 AND person_2_id = ' + personCanHelpId;
    orm.update("task", colsVars, condition, (res) => {
      cb(res);
    });
  },
  disapprovePersonToHelp: function (taskId, taskOwnerId, personCanHelpIdNotApproved, cb) {
    var colsVars = { "person_2_id": null, "status_id": 2 }; // go back to waiting state
    // the person in need can remove the helper at anytime or state of the task -> this will move te status back to '2' (waiting)
    var condition = 'id = ' + taskId + ' person_1_id = ' + taskOwnerId + ' AND status_id < 4 AND person_2_id = ' + personCanHelpIdNotApproved;
    orm.update("task", colsVars, condition, (res) => {
      cb(res);
    });
  },
  // Shouldn't use the other functions because they are too generic
  // The variables cols and vals are arrays.
  create(cols, vals, cb) {
    orm.create('task', cols, vals, (res) => {
      cb(res);
    });
  },
  update(objColVals, condition, cb) {
    orm.update('task', objColVals, condition, (res) => {
      cb(res);
    });
  },
  delete(condition, cb) {
    orm.delete('task', condition, (res) => {
      cb(res);
    });
  },
};

// Export the database and API functions for the controller.
module.exports = task;
