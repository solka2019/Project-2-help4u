console.log("Starting server.js...");
var express = require("express");


// port will be whatever heroku gives me or 8080
var PORT = process.env.PORT || 8080;

var app = express();

// Serve static content for the app from the "public" directory in the application directory.
app.use(express.static("public"));

// Parse application body as JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Set Handlebars.
var exphbs = require("express-handlebars");

app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

// Import routes and give the server access to them.
var routes = require("./controllers/controller");

app.use(routes);
app.use(express.static('public/assets/img')); 

// Timeout to ensure everything is wired-up when running in Heroku
// this is ok to be here also for local runs... it will only slowdown a bit!
function haltOnTimedout(req, res, next) {
  if (!req.timedout) next();
}


app.use(haltOnTimedout);

// Start our server so that it can begin listening to client requests.
app.listen(PORT, function() {
  // Log (server-side) when our server has started
  console.log("Server listening on: http://localhost:" + PORT);
});
