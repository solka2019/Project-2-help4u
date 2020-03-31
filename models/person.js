// Import the ORM to create functions that will interact with the database.
const orm = require("../config/orm");

const person = {
  all(cb) {
    orm.all("person", (res) => {
      cb(res);
    });
  },
  get(profileEmail, cb) {
    if (!profileEmail) {
      cb("error: empty email");
      return;
    }
    // need to create a query that can check either if the email provided is a person in need, or someone that can help, and order by the task type
    orm.allBy("person", "profile_email='" + profileEmail + "'", (res) => {
      cb(res);
    });
  },
  getLocationFromIdAsync: async function(id){
    return new Promise ((resolve, reject) => {
      this.getLocationFromId(id, (result) => {
        resolve(result);
      });
    });
  },
  getLocationFromId(id, cb)
  {
   //make sure the id passed in is a number
    try
    {
      let numericId = parseInt(id, 10);
      orm.selectBy('person', 'profile_location', 'id=' + numericId, (res) => {
        cb(res);
      });
    }
    catch(e) {
      cb("error");
    }
  },
  getEmailFromId(id, cb) {
    //make sure the id passed in is a number
    try
    {
      let numericId = parseInt(id, 10);
      orm.selectBy('person', 'profile_email', 'id=' + numericId, (res) => {
        cb(res);
      });
    }
    catch(e) {
      cb("error");
    }
  },
  setFeedback(profileEmail, isPositive, newFeedback, cb) {
    if (!profileEmail) {
      // these cannot be empty
      cb("error: empty email");
      return;
    }
    let colsVars;
    if (isPositive) {
      colsVars = { positive_points: newFeedback };
    } else {
      colsVars = { negative_points: newFeedback };
    }

    orm.update('person', colsVars, `profile_email="${profileEmail}"`, (res) => {
      cb(res);
    });
  },
  create(profileEmail, profileName, profileLocation, cb) {
    if (!profileEmail || !profileName) {
      // these cannot be empty
      cb ("error: empty email or name.");
      return;
    }

    // check if the user already exists in the database, it does, don't retry to re add
    this.get(profileEmail, (getUserResult) => {
      console.log(getUserResult);
      
      if(getUserResult && getUserResult.length > 0)
      {
        // already has the user in the db, just return that row
        var existingUserData = getUserResult[0];
        cb(existingUserData);
        return;
      }

      let cols = [];
      let vals = [];
  
      cols.push('profile_email');
      vals.push(profileEmail);
      cols.push('profile_name');
      vals.push(profileName);
  
      // Only send field if not null
      if (profileLocation) {
        cols.push("profile_location");
        vals.push(profileLocation);
      }
  
      cols.push('first_date');
      //https://stackoverflow.com/questions/5129624/convert-js-date-time-to-mysql-datetime
      vals.push(new Date().toISOString().slice(0, 19).replace('T', ' ')); 
  
      orm.create('person', cols, vals, (res) => {
        cb(res);
      });
    });
  },
  // TODO: need to find a way to delete a person from the system.  This is complicated because needs to remove rows from task table because of foreign key constrains will fail delete
  //   delete: function (profileEmail, cb) {
  //     orm.delete("person", "profile_email=" + profileEmail, function (res) {
  //       cb(res);
  //     });
  //   }
};

// Export the database and API functions for the controller.
module.exports = person;
