var wufoo = require("../server/wufoo/wufooApi.js");
var builder = require("../server/wufoo/wufooQueryBuilder");
var con = require("../server/wufoo/wufooConstants");
var query = wufoo.queries;

module.exports = function (app, passport) {

    // =====================================
    // HOME PAGE (with login links) ========
    // =====================================
    app.get('/', function (req, res) {
        res.render('index.ejs'); // load the index.ejs file
    });

    // =====================================
    // LOGIN ===============================
    // =====================================
    // show the login form
    app.get('/login', function (req, res) {

        // render the page and pass in any flash data if it exists
        res.render('login.ejs', {message: req.flash('loginMessage')});
    });

    // process the login form
    // process the login form
    app.post('/login', passport.authenticate('local-login', {
        successRedirect: '/filter', // redirect to the secure profile section
        failureRedirect: '/login', // redirect back to the signup page if there is an error
        failureFlash: true // allow flash messages
    }));

    // =====================================
    // SIGN-UP ==============================
    // =====================================
    // show the sign-up form
    app.get('/signup', function (req, res) {

        // render the page and pass in any flash data if it exists
        res.render('signup.ejs', {message: req.flash('signupMessage')});
    });

    // process the sign-up form
    app.post('/signup', passport.authenticate('local-signup', {
        successRedirect: '/filter', // redirect to the secure profile section
        failureRedirect: '/signup', // redirect back to the sign-up page if there is an error
        failureFlash: true // allow flash messages
    }));

    // =====================================
    // FILTER SECTION =====================
    // =====================================
    // we will want this protected so you have to be logged in to visit
    // we will use route middleware to verify this (the isLoggedIn function)
    app.get('/filter', isLoggedIn, function (req, res) {
        var accessFields = con.generalFields;
        if (isAdmin(req)) {
            accessFields = con.allFields;
        }
        wufoo.makeQuery(query.all, function (body) {
            res.render('filter.ejs', {
                wufoo: body,
                operators: con.operators,
                fields: accessFields
            });
        });
    });

    // =====================================
    // ALLERGIES ===========================
    // =====================================
    // we will want this protected so you have to be logged in to visit
    // we will use route middleware to verify this (the isLoggedIn function)
    app.get('/allergies', requireAdmin, function (req, res) {
        wufoo.makeQuery(query.allergy, function (body) {
            res.render('filter.ejs', {
                wufoo: body,
                operators: con.operators,
                fields: con.adminFields //admin page only
            });
        });
    });

    // =====================================
    // SEARCH ===========================
    // =====================================
    // we will want this protected so you have to be logged in to visit
    // we will use route middleware to verify this (the isLoggedIn function)

    app.get('/search', isLoggedIn, function (req, res) {
        if (req.query['field'] && req.query['operator'] && req.query['value']) {
            var accessFields = con.generalFields;
            if (isAdmin(req)) {
                accessFields = con.adminFields;
            }
            wufoo.makeQuery(builder.customQuery(req.query['field'], req.query['operator'], req.query['value']), function (body) {
                res.render('search.ejs', {
                    wufoo: body,
                    operators: con.operators,
                    fields: accessFields
                });
            });
        }
    });

    // =====================================
    // NOT AUTHORIZED ======================
    // =====================================
    app.get('/noprivilege', isLoggedIn, function (req, res) {
        res.render('noprivilege.ejs');
    });

    // =====================================
    // LOGOUT ==============================
    // =====================================
    app.get('/logout', function (req, res) {
        req.logout();
        res.redirect('/');
    });
};

// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {

    // if user is authenticated in the session, carry on
    if (req.isAuthenticated())
        return next();

    // if they aren't redirect them to the home page
    res.redirect('/');
}

function requireAdmin(req, res, next) {
    if (!req.isAuthenticated()) {
        res.redirect('/');
    } else if (req.user && req.user.is_admin) {
        return next();
    } else {
        res.redirect('/noprivilege');
    }
}

function isAdmin(req) {
    return req.user.is_admin;
}