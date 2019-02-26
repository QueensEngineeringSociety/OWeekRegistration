// set up ======================================================================
var express = require('express');
var app = express();
var port = process.env.PORT || 8080;
var passport = require('passport');
var flash = require('connect-flash');
var morgan = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var path = require('path');
var PropertiesReader = require('properties-reader');

var properties = PropertiesReader(__dirname + "/../config/passport.ini");
var db = require('../config/database.js');

// configuration ===============================================================
db.connect(); // connect to our database

// set up our express application
app.use(morgan('dev')); // log every request to the console
app.use(cookieParser()); // read cookies (needed for auth)
app.use(bodyParser.json()); // get information from html forms
app.use(bodyParser.urlencoded({extended: true})); // get information from html forms
app.use(express.static(path.join(__dirname, '../public')));

app.set('view engine', 'ejs'); // set up ejs for templating
app.set('views', path.join(__dirname, '../public/views'));

// required for passport
app.use(session({secret: properties.get('secret'), resave: true, saveUninitialized: true}));
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
require('../config/passport')(passport); // pass passport for configuration
app.use(flash()); // use connect-flash for flash messages stored in session

// routes ======================================================================
require('../app/routes.js')(app, passport); // load our routes and pass in our app and fully configured passport

// launch ======================================================================
app.listen(port);

//TODO improve user management
//TODO improve visuals of /allgroups
//TODO improve visuals of /onegroup
//TODO can only see one person in group