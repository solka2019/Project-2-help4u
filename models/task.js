// Import the ORM to create functions that will interact with the database.
const orm = require("../config/orm");

const task = {
  all(cb) {
    orm.all('tasks_v_persons', (res) => {
      cb(res);
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
  allInNeed(cb) {
    orm.allBy(
      'tasks_v_persons',
      'type_id=1 ORDER BY date_created DESC LIMIT 1000',
      (res) => {
        cb(res);
      },
    );
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

  // The following APIs exposed are very important - specially "acceptTohelpInTask" because
  // multiple people might try to accept a single person in need, which means we should use
  // the conditions to make sure we are not overriding the requests from other people that
  // could have happen in the server while the page of a user shows older data.
  acceptToHelpInTask(taskId, personCanHelpId, cb) {
    let colsVars;
    let condition;
    colsVars = { person_2_id: personCanHelpId, status_id: 3 };
    condition = 'id = ' + taskId + ' AND status_id = 2';
    orm.update('task', colsVars, condition, (res) => {
      cb(res);
    });
  },
  approvePersonToHelpInTask(taskId, personCanHelpId, cb) {
    const colsVars = { status_id: 4 }; // go to approved state
    const condition = "id = ";
    `${taskId} AND status_id < 4 AND person_2_id = ${personCanHelpId}`;
    orm.update('task', colsVars, condition, (res) => {
      cb(res);
    });
  },
  disapprovePersonToHelpInTask(taskId, personCanHelpIdNotApproved, cb) {
    const colsVars = { person_2_id: null, status_id: 2 }; // go back to waiting state
    const condition = "id = ";
    `${taskId} AND status_id < 4 AND person_2_id = ${personCanHelpIdNotApproved}`; // the person in need can remove the helper at anytime
    orm.update('task', colsVars, condition, (res) => {
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
