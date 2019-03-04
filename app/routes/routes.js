const userManagement = require("../../app/routes/userManagement");
const regInfo = require("../../app/routes/registrationInfo");
const search = require("../../app/routes/search");
const groups = require("../../app/routes/groups");

const ROUTE_HOME = "/";
const ROUTE_LOGIN = "/login";
const ROUTE_USER_MANAGEMENT = "/usermanagement";
const ROUTE_SIGN_UP = "/signup";
const ROUTE_USER_EDIT = "/useredit";
const ROUTE_USER_DELETE = "/userdelete";
const ROUTE_FILTER = "/filter";
const ROUTE_AGE = "/age";
const ROUTE_FOOD_RESTRICTIONS = "/food_restrictions";
const ROUTE_PRIMER = "/primer";
const ROUTE_MEDICAL = "/medical";
const ROUTE_PRONOUNS = "/pronouns";
const ROUTE_ACCESSIBILITY = "/accessibility";
const ROUTE_PAY_PERSON = "/payPerson";
const ROUTE_PAY_ONLINE = "/payOnline";
const ROUTE_PAY_MAIL = "/payMail";
const ROUTE_UNPAID = "/unpaid";
const ROUTE_SEARCH = "/search";
const ROUTE_NET_ID = "/netid";
const ROUTE_ALL_GROUPS = "/allgroups";
const ROUTE_ONE_GROUP = "/onegroup";
const ROUTE_UPDATE_MAXNUM = "/updatemaxnum";
const ROUTE_ASSIGN = "/assign";
const ROUTE_CLEAR_GROUPS = "/cleargroups";
const ROUTE_ERROR = "/error";
const ROUTE_LOGOUT = "/logout";

module.exports = function (app, passport) {
    app.get(ROUTE_HOME, function (req, res) {
            if (req.user) {
                res.redirect(ROUTE_FILTER);
            } else {
                res.render('index.ejs');
            }
        }
    );

    app.get(ROUTE_LOGIN, function (req, res) {
        if (req.user) {
            res.redirect(ROUTE_FILTER);
        } else {
            res.render('login.ejs', {message: req.flash('loginMessage')});
        }
    });

    app.post(ROUTE_LOGIN, passport.authenticate('local-login', {
        successRedirect: ROUTE_FILTER,
        failureRedirect: ROUTE_LOGIN,
        failureFlash: true
    }));

    app.get(ROUTE_USER_MANAGEMENT, requireAdmin, function (req, res) {
        res.render('users.ejs', {message: req.flash('signupMessage')});
    });

    app.post(ROUTE_SIGN_UP, requireAdmin, function (req, res) {
        userManagement.post.signUp(req, res);
    });

    app.post(ROUTE_USER_EDIT, requireAdmin, function (req, res) {
        userManagement.post.edit(req, res);
    });

    app.get(ROUTE_USER_DELETE, requireAdmin, function (req, res) {
        userManagement.get.delete(req, res);
    });

    app.post(ROUTE_USER_DELETE, requireAdmin, function (req, res) {
        userManagement.post.delete(req, res);
    });

    app.get(ROUTE_FILTER, isLoggedIn, function (req, res) {
        regInfo.get.displayAll(req, res);
    });

    app.get(ROUTE_AGE, isLoggedIn, function (req, res) {
        regInfo.get.displayAge(req, res);
    });

    app.get(ROUTE_FOOD_RESTRICTIONS, requireAdmin, function (req, res) {
        regInfo.get.displayFood(req, res);
    });

    app.get(ROUTE_PRIMER, requireAdmin, function (req, res) {
        regInfo.get.displayPrimer(req, res);
    });

    app.get(ROUTE_MEDICAL, requireAdmin, function (req, res) {
        regInfo.get.displayMedical(req, res);
    });

    app.get(ROUTE_PRONOUNS, requireAdmin, function (req, res) {
        regInfo.get.displayPronouns(req, res);
    });

    app.get(ROUTE_ACCESSIBILITY, requireAdmin, function (req, res) {
        regInfo.get.displayAccessibility(req, res);
    });

    app.get(ROUTE_PAY_PERSON, isLoggedIn, function (req, res) {
        regInfo.get.displayPayPerson(req, res);
    });

    app.get(ROUTE_PAY_MAIL, isLoggedIn, function (req, res) {
        regInfo.get.displayPayMail(req, res);
    });

    app.get(ROUTE_PAY_ONLINE, isLoggedIn, function (req, res) {
        regInfo.get.displayPayOnline(req, res);
    });

    app.get(ROUTE_UNPAID, isLoggedIn, function (req, res) {
        regInfo.get.displayUnpaid(req, res);
    });

    app.get(ROUTE_SEARCH, isLoggedIn, function (req, res) {
        search.get.general(req, res);
    });

    app.get(ROUTE_NET_ID, isLoggedIn, function (req, res) {
        search.get.netid(req, res);
    });

    app.get(ROUTE_ALL_GROUPS, requireAdmin, function (req, res) {
        groups.get.all(req, res);
    });

    app.post(ROUTE_ONE_GROUP, requireAdmin, function (req, res) {
        groups.post.specificOne(req, res);
    });

    app.post(ROUTE_UPDATE_MAXNUM, requireAdmin, function (req, res) {
        groups.post.maxGroupNum(req, res);
    });

    app.post(ROUTE_ASSIGN, requireAdmin, function (req, res) {
        groups.post.assign(req, res);
    });

    app.post(ROUTE_CLEAR_GROUPS, requireAdmin, function (req, res) {
        groups.post.clear(req, res);
    });

    app.get(ROUTE_ERROR, isLoggedIn, function (req, res) {
        res.render('error.ejs', {errorMessage: "You don't have the privileges to see this."});
    });

    app.get(ROUTE_LOGOUT, function (req, res) {
        req.logout();
        res.redirect(ROUTE_HOME);
    });
};

function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    } else {
        res.redirect(ROUTE_HOME);
    }
}

function requireAdmin(req, res, next) {
    if (!req.isAuthenticated()) {
        res.redirect(ROUTE_HOME);
    } else if (req.user && req.user.is_admin) {
        return next();
    } else {
        res.redirect(ROUTE_ERROR);
    }
}