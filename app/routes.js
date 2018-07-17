var wufoo = require("../server/wufoo/wufooApi.js");
var builder = require("../server/wufoo/wufooQueryBuilder");
var dbConn = require("../config/database.js");
var con = require("../server/wufoo/wufooConstants");
var User = require("./models/user");
var query = wufoo.queries;

var strongPassRegex = RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\\$%\\^&\\*])(?=.{8,})");

module.exports = function (app, passport) {

    // =====================================
    // HOME PAGE (with login links) ========
    // =====================================
    app.get('/', function (req, res) {
            if (req.user) {
                res.redirect('filter');
            } else {
                res.render('index.ejs'); // load the index.ejs file}
            }
        }
    );

    // =====================================
    // LOGIN ===============================
    // =====================================
    // show the login form
    app.get('/login', function (req, res) {
        // render the page and pass in any flash data if it exists
        if (req.user) {
            res.redirect('filter');
        } else {
            res.render('login.ejs', {message: req.flash('loginMessage')});
        }
    });

    // process the login form
    app.post('/login', passport.authenticate('local-login', {
        successRedirect: '/filter', // redirect to the secure profile section
        failureRedirect: '/login', // redirect back to the signup page if there is an error
        failureFlash: true // allow flash messages
    }));

    // =====================================
    //USER MGM =============================
    // =====================================
    // show the user addition form
    app.get('/users', requireAdmin, function (req, res) {
        // render the page and pass in any flash data if it exists
        res.render('users.ejs', {message: req.flash('signupMessage')});
    });

    // process the sign-up of new user
    app.post('/signup', requireAdmin, function (req, res) {
        dbConn.query("SELECT * FROM users WHERE email = ?", [req.body.email], function (err, rows) {
            if (err) {
                console.log("ERROR: " + err);
            }
            if (rows.length) {
                res.render('error.ejs', {errorMessage: "That email already exists"});
            } else if (!strongPassRegex.test(req.body.password)) {
                res.render('error.ejs', {errorMessage: "That password doesn't match the requirements: 1 lowercase, uppercase, number, special character and at least 8 characters long"});
            } else {
                // if there is no user with that username, then create that user
                console.log(strongPassRegex);
                console.log(strongPassRegex.test(req.body.password));
                var newUser = new User(req.body.first_name, req.body.last_name, req.body.email, req.body.password, isAdmin(req));
                var insertQuery = "INSERT INTO users (first_name,last_name,email,password,created,is_admin) values (?,?,?,?,?,?);";
                dbConn.query(insertQuery, [newUser.first_name, newUser.last_name, newUser.email, newUser.password, newUser.created, newUser.is_admin],
                    function (err, rows) {
                        if (err)
                            console.log("ERROR: " + err);
                        newUser.id = rows.insertId;
                        res.render('users.ejs', {message: req.flash('signupMessage')});
                    });
            }
        });
    });

    // process the edit of a user
    app.post('/useredit', requireAdmin, function (req, res) {
        dbConn.query("SELECT * FROM users WHERE email = ?", [req.body.email], function (err, rows) {
            if (err) {
                console.log("ERROR: " + err);
            }
            if (!rows.length) {

                res.render('error.ejs', {errorMessage: "That email doesn't exist"});
            } else if (!strongPassRegex.test(req.body.password)) {
                res.render('error.ejs', {errorMessage: "That password doesn't match the requirements: 1 lowercase, uppercase, number, special character and at least 8 characters long"});
            } else {
                var replacementUser = new User(req.body.first_name, req.body.last_name, req.body.email, req.body.password, isAdmin(req));
                var query = "UPDATE users SET first_name=?, last_name=?,email=?,password=?,is_admin=? WHERE id=?;";
                dbConn.query(query, [replacementUser.first_name, replacementUser.last_name, replacementUser.email, replacementUser.password, replacementUser.is_admin, rows[0].id],
                    function (err, rows) {
                        if (err)
                            console.log("ERROR: " + err);
                        replacementUser.id = rows.insertId;
                        res.render('users.ejs', {message: req.flash('signupMessage')});
                    });
            }
        });
    });

    // =====================================
    // FILTER SECTION =====================
    // =====================================
    // we will want this protected so you have to be logged in to visit
    // we will use route middleware to verify this (the isLoggedIn function)
    app.get('/filter', isLoggedIn, function (req, res) {
        var accessFields = con.generalFields;
        var admin = isAdmin(req);
        if (admin) {
            accessFields = con.allFields;
        }
        wufoo.makeQuery(0, query.all, function (body) {
            res.render('filter.ejs', {
                wufoo: body,
                operators: con.operators,
                fields: accessFields,
                headings: con.headings,
                isAdmin: admin
            });
        });
    });

    // =====================================
    // Age =================================
    // =====================================
    // we will want this protected so you have to be logged in to visit
    // we will use route middleware to verify this (the isLoggedIn function)
    app.get('/age', isLoggedIn, function (req, res) {
        var accessFields = con.generalFields;
        var admin = isAdmin(req);
        if (admin) {
            accessFields = con.allFields;
        }
        wufoo.makeQuery(0, query.age, function (body) {
            res.render('filter.ejs', {
                wufoo: body,
                operators: con.operators,
                fields: accessFields,
                headings: con.headings,
                isAdmin: admin
            });
        });
    });

    // =====================================
    // FOOD RESTRICTIONS====================
    // =====================================
    // we will want this protected so you have to be logged in to visit
    // we will use route middleware to verify this (the isLoggedIn function)
    app.get('/food_restrictions', requireAdmin, function (req, res) {
        wufoo.makeQuery(0, query.foodRestrictions, function (body) {
            res.render('filter.ejs', {
                wufoo: body,
                operators: con.operators,
                fields: con.allFields,
                headings: con.headings,
                isAdmin: true
            });
        });
    });

    // =====================================
    // Primer ==============================
    // =====================================
    // we will want this protected so you have to be logged in to visit
    // we will use route middleware to verify this (the isLoggedIn function)
    app.get('/primer', requireAdmin, function (req, res) {
        wufoo.makeQuery(0, query.wantPrimer, function (body) {
            res.render('filter.ejs', {
                wufoo: body,
                operators: con.operators,
                fields: con.allFields,
                headings: con.headings,
                isAdmin: true
            });
        });
    });

    // =====================================
    // Medical ==============================
    // =====================================
    // we will want this protected so you have to be logged in to visit
    // we will use route middleware to verify this (the isLoggedIn function)
    app.get('/medical', requireAdmin, function (req, res) {
        wufoo.makeQuery(0, query.medicalConcerns, function (body) {
            res.render('filter.ejs', {
                wufoo: body,
                operators: con.operators,
                fields: con.allFields,
                headings: con.headings,
                isAdmin: true
            });
        });
    });

    // =====================================
    // Pronouns ============================
    // =====================================
    // we will want this protected so you have to be logged in to visit
    // we will use route middleware to verify this (the isLoggedIn function)
    app.get('/pronouns', requireAdmin, function (req, res) {
        var accessFields = con.generalFields;
        var admin = isAdmin(req);
        if (admin) {
            accessFields = con.allFields;
        }
        wufoo.makeQuery(0, query.pronoun, function (body) {
            res.render('filter.ejs', {
                wufoo: body,
                operators: con.operators,
                fields: accessFields,
                headings: con.headings,
                isAdmin: admin
            });
        });
    });

    // =====================================
    // Accessibility =======================
    // =====================================
    // we will want this protected so you have to be logged in to visit
    // we will use route middleware to verify this (the isLoggedIn function)
    app.get('/accessibility', requireAdmin, function (req, res) {
        wufoo.makeQuery(0, query.accessibilityConcerns, function (body) {
            res.render('filter.ejs', {
                wufoo: body,
                operators: con.operators,
                fields: con.allFields,
                headings: con.headings,
                isAdmin: true
            });
        });
    });

    // =====================================
    // PayPerson ===========================
    // =====================================
    // we will want this protected so you have to be logged in to visit
    // we will use route middleware to verify this (the isLoggedIn function)
    app.get('/payPerson', isLoggedIn, function (req, res) {
        var accessFields = con.generalFields;
        var admin = isAdmin(req);
        if (admin) {
            accessFields = con.allFields;
        }
        wufoo.makeQuery(0, query.payInPerson, function (body) {
            res.render('filter.ejs', {
                wufoo: body,
                operators: con.operators,
                fields: accessFields,
                headings: con.headings,
                isAdmin: admin
            });
        });
    });

    // =====================================
    // PayMail ===========================
    // =====================================
    // we will want this protected so you have to be logged in to visit
    // we will use route middleware to verify this (the isLoggedIn function)
    app.get('/payMail', isLoggedIn, function (req, res) {
        var accessFields = con.generalFields;
        var admin = isAdmin(req);
        if (admin) {
            accessFields = con.allFields;
        }
        wufoo.makeQuery(0, query.payByMail, function (body) {
            res.render('filter.ejs', {
                wufoo: body,
                operators: con.operators,
                fields: accessFields,
                headings: con.headings,
                isAdmin: admin
            });
        });
    });

    // =====================================
    // PayOnline ===========================
    // =====================================
    // we will want this protected so you have to be logged in to visit
    // we will use route middleware to verify this (the isLoggedIn function)
    app.get('/payOnline', isLoggedIn, function (req, res) {
        var accessFields = con.generalFields;
        var admin = isAdmin(req);
        if (admin) {
            accessFields = con.allFields;
        }
        wufoo.makeQuery(0, query.payOnline, function (body) {
            res.render('filter.ejs', {
                wufoo: body,
                operators: con.operators,
                fields: accessFields,
                headings: con.headings,
                isAdmin: admin
            });
        });
    });

    // =====================================
    // Unpaid===============================
    // =====================================
    // we will want this protected so you have to be logged in to visit
    // we will use route middleware to verify this (the isLoggedIn function)
    app.get('/unpaid', isLoggedIn, function (req, res) {
        var accessFields = con.generalFields;
        var admin = isAdmin(req);
        if (admin) {
            accessFields = con.allFields;
        }
        wufoo.makeQuery(0, query.unpaid, function (body) {
            res.render('filter.ejs', {
                wufoo: body,
                operators: con.operators,
                fields: accessFields,
                headings: con.headings,
                isAdmin: admin
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
            var admin = isAdmin(req);
            if (admin) {
                accessFields = con.allFields;
            }
            wufoo.makeQuery(0, builder.customQuery(req.query['field'], req.query['operator'], req.query['value']), function (body) {
                res.render('filter.ejs', {
                    wufoo: body,
                    operators: con.operators,
                    fields: accessFields,
                    headings: con.headings,
                    isAdmin: admin
                });
            });
        }
    });

    // =====================================
    // NOT AUTHORIZED ======================
    // =====================================
    app.get('/error', isLoggedIn, function (req, res) {
        res.render('error.ejs', {errorMessage: "You don't have the privileges to see this."});
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
        res.redirect('/error');
    }
}

function isAdmin(req) {
    return req.user.is_admin;
}