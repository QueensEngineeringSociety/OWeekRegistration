// set up ======================================================================
const express = require('express');
const app = express();
const port = process.env.PORT || 8080;
const passport = require('passport');
const flash = require('connect-flash');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const session = require('express-session');
const path = require('path');
const PropertiesReader = require('properties-reader');

const properties = PropertiesReader(__dirname + "/../config/passport.ini");
const db = require('../config/database/queries.js');

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
require('../app/routes/routes.js')(app, passport); // load our routes and pass in our app and fully configured passport

// launch ======================================================================
app.listen(port);