const userManagement = require("../../app/routes/userManagement");
const regInfo = require("../../app/routes/registrationInfo");
const search = require("../../app/routes/search");
const groups = require("../../app/routes/groups");
const constants = require("../../server/util");
const routes = constants.routes;
const views = constants.views;

module.exports = function (app, passport) {
    app.get(routes.HOME, function (req, res) {
            if (req.user) {
                res.redirect(routes.FILTER);
            } else {
                res.render(views.INDEX);
            }
        }
    );

    app.get(routes.LOGIN, function (req, res) {
        if (req.user) {
            res.redirect(routes.FILTER);
        } else {
            res.render(views.LOGIN, {message: req.flash('loginMessage')});
        }
    });

    app.post(routes.LOGIN, passport.authenticate('local-login', {
        successRedirect: routes.FILTER,
        failureRedirect: routes.LOGIN,
        failureFlash: true
    }));

    app.get(routes.USER_MANAGEMENT, requireAdmin, function (req, res) {
        res.render(views.USERS, {message: req.flash('signupMessage')});
    });

    app.post(routes.SIGN_UP, requireAdmin, function (req, res) {
        userManagement.post.signUp(req, res);
    });

    app.post(routes.USER_EDIT, requireAdmin, function (req, res) {
        userManagement.post.edit(req, res);
    });

    app.get(routes.USER_DELETE, requireAdmin, function (req, res) {
        userManagement.get.delete(req, res);
    });

    app.post(routes.USER_DELETE, requireAdmin, function (req, res) {
        userManagement.post.delete(req, res);
    });

    app.get(routes.FILTER, isLoggedIn, function (req, res) {
        regInfo.get.displayAll(req, res);
    });

    app.get(routes.AGE, isLoggedIn, function (req, res) {
        regInfo.get.displayAge(req, res);
    });

    app.get(routes.FOOD_RESTRICTIONS, requireAdmin, function (req, res) {
        regInfo.get.displayFood(req, res);
    });

    app.get(routes.PRIMER, requireAdmin, function (req, res) {
        regInfo.get.displayPrimer(req, res);
    });

    app.get(routes.MEDICAL, requireAdmin, function (req, res) {
        regInfo.get.displayMedical(req, res);
    });

    app.get(routes.PRONOUNS, requireAdmin, function (req, res) {
        regInfo.get.displayPronouns(req, res);
    });

    app.get(routes.ACCESSIBILITY, requireAdmin, function (req, res) {
        regInfo.get.displayAccessibility(req, res);
    });

    app.get(routes.PAY_PERSON, isLoggedIn, function (req, res) {
        regInfo.get.displayPayPerson(req, res);
    });

    app.get(routes.PAY_MAIL, isLoggedIn, function (req, res) {
        regInfo.get.displayPayMail(req, res);
    });

    app.get(routes.PAY_ONLINE, isLoggedIn, function (req, res) {
        regInfo.get.displayPayOnline(req, res);
    });

    app.get(routes.UNPAID, isLoggedIn, function (req, res) {
        regInfo.get.displayUnpaid(req, res);
    });

    app.get(routes.SEARCH, isLoggedIn, function (req, res) {
        search.get.general(req, res);
    });

    app.get(routes.NET_ID, isLoggedIn, function (req, res) {
        search.get.netid(req, res);
    });

    app.get(routes.ALL_GROUPS, requireAdmin, function (req, res) {
        groups.get.all(req, res);
    });

    app.post(routes.ONE_GROUP, requireAdmin, function (req, res) {
        groups.post.specificOne(req, res);
    });

    app.post(routes.UPDATE_MAXNUM, requireAdmin, function (req, res) {
        groups.post.maxGroupNum(req, res);
    });

    app.post(routes.ASSIGN, requireAdmin, function (req, res) {
        groups.post.assign(req, res);
    });

    app.post(routes.CLEAR_GROUPS, requireAdmin, function (req, res) {
        groups.post.clear(req, res);
    });

    app.get(routes.ERROR, isLoggedIn, function (req, res) {
        res.render(views.ERROR, {errorMessage: "You don't have the privileges to see this."});
    });

    app.get(routes.LOGOUT, function (req, res) {
        req.logout();
        res.redirect(routes.HOME);
    });
};

function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    } else {
        res.redirect(routes.HOME);
    }
}

function requireAdmin(req, res, next) {
    if (!req.isAuthenticated()) {
        res.redirect(routes.HOME);
    } else if (req.user && req.user.is_admin) {
        return next();
    } else {
        res.redirect(routes.ERROR);
    }
}