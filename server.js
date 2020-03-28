console.log("Starting server.js...");

let express = require("express");
let PORT = process.env.PORT || 8080;
let app = express();
let path = require('path');
let myLayoutDir = path.join(__dirname,'views', 'layouts');
let myViewDir = path.join(__dirname,'views', 'layouts');


app.use(express.static("public"));
app.use(express.urlencoded({
  extended: true
}));

app.use(express.json());

let exphbs = require("express-handlebars");

app.set('views', myViewDir);
app.engine("hbs", exphbs({
  defaultLayout: "main",
  extname: 'hbs',
  layoutsDir: myLayoutDir
}));

app.set("view engine", "hbs");

// routing
app.get('/', (req, res) => {
  
  res.render('index', {
    title: 'Home Page',
    name: "Connecting People"
    

  });
});

app.get('can-help', (req, res) => {
  res.render('can-help', {title: "I Can Help"});
});

app.get('/need-help', (req, res) => {
  res.render('need-help', {title: "I Need Help"});
});

app.get('/help-bucket', (req, res) => {
  res.render('help-bucket', {title: "My Help Bucket"});
});
let routes = require("./controllers/controller");

app.use(routes);
app.use(express.static('public/assets/img'));

function haltOnTimedout(req, res, next) {
  if (!req.timedout) next();
}

app.use(haltOnTimedout);

app.listen(PORT, function () {
  console.log("Server listening on: http://localhost:" + PORT);
});