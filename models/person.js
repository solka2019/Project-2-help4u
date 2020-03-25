// Import the ORM to create functions that will interact with the database.
var orm = require("../config/orm");

var person = {
    all: function (cb) {
        orm.all("person", function (res) {
            cb(res);
        });
    },
    get: function (profileEmail, cb) {
        if (!profileEmail) {
            cb("error: empty email");
            return;
        }
        // need to create a query that can check either if the email provided is a person in need, or someone that can help, and order by the task type
        orm.allBy("person",
            "profile_email=" + profileEmail,
            function (res) {
                cb(res);
            })
    },
    create: function (profileEmail, profileName, profileLocation, cb) {
        if (!profileEmail || !profileName) {
            // these cannot be empty
            cb("error: empty email or name");
            return;
        }

        var cols[];
        var vals[];

        cols.push("profile_email");
        vals.push(profileEmail);
        cols.push("profile_name");
        vals.push(profileName);

        // Only send field if not null
        if (profileLocation) {
            cols.push("profile_location");
            vals.push(profileLocation);
        }

        cols.push("first_date");
        vals.push(new Date().toLocaleString()); //https://stackoverflow.com/questions/4744299/how-to-get-datetime-in-javascript/23394552

        orm.create("person", cols, vals, function (res) {
            cb(res);
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