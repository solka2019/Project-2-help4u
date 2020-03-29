console.log("Starting server.js...");
const express = require("express");
const path = require("path");
// Set Handlebars.
const exphbs = require("express-handlebars");

// port will be whatever heroku gives me or 8080
const PORT = process.env.PORT || 8080;

// app configuration
const app = express();
const myLayoutDir = path.join(__dirname, 'views', 'layouts');
const myViewDir = path.join(__dirname, 'views');

// The first parameter is the name of the engine to be created, and it has to match to the
// extension of the handlebar files containing the HTML.  If the configuration below mixes
// 'hbs' with 'handlebars' it will not work!!! It has to be one of the other!
app.engine(
  "hbs",
  exphbs({
    defaultLayout: "main",
    extname: "hbs",
    layoutsDir: myLayoutDir,
  })
);
// Here we set at the app level the engine to render the views - also the name needs to match!
app.set("view engine", "hbs");
app.set("views", myViewDir);

// Serve static content for the app from the "public" directory in the application directory.
app.use(express.static("public"));
// Same thing for the images.
app.use(express.static('public/assets/img'));
// Parse application body as JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Import routes and give the server access to them.
// In the controller is where we determine how to route
// the navigation from page to page. Here it's just being used by the app.
const routes = require("./controllers/controller");

app.use(routes);

// Timeout to ensure everything is wired-up when running in Heroku
// this is ok to be here also for local runs... it will only slowdown a bit!
function haltOnTimedout(req, res, next) {
  if (!req.timedout) next();
}
app.use(haltOnTimedout);

// Start our server so that it can begin listening to client requests.
app.listen(PORT, () => {
  // Log (server-side) when our server has started
  console.log('Server listening on: http://localhost:' + PORT);
});
