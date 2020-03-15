const express = require('express');
const secure = require('express-force-https');
const app = express();
const passport = require('passport');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const session = require('express-session');
const path = require('path');
const PropertiesReader = require('properties-reader');
const compression = require("compression");
const helmet = require("helmet");
const csrf = require("csurf");

const properties = PropertiesReader(__dirname + "/../config/passport.cfg");
const db = require('../models/database/queries.js');

//miscellaneous
db.connect();
app.use(compression()); //compress renderData to improve performance
app.use(bodyParser.json()); //parse json body renderData
app.use(bodyParser.urlencoded({extended: true})); //parse x-www-form-urlencoded renderData
app.use(express.static(path.join(__dirname, '../public')));
app.set('view engine', 'ejs'); // set up ejs for templating
app.set('views', path.join(__dirname, '../public/views'));

//allow authentication and persistent sessions
app.use(cookieParser());
app.use(session({secret: properties.get('secret'), resave: true, saveUninitialized: true}));
app.use(passport.initialize({}));
app.use(passport.session({}));

//security configurations
app.use(secure);
app.use(helmet());
app.use(csrf({cookie: true})); //must be after after cookie parsing and session set

require('../controllers/session/passport')(passport); // pass passport for configuration
require('./routes.js')(app, passport);

module.exports = app;