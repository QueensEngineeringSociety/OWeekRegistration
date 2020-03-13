const controllers = require("../controllers");
const constants = require("./util");
const logger = require("./logger")(__filename);
const routes = constants.routes;
const views = constants.views;

module.exports = function (app, passport) {
    app.get(routes.HOME, function (req, res) {
        if (req.user) {
            res.redirect(routes.FILTER);
        } else {
            res.render(views.INDEX);
        }
    });

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

    app.get(routes.USER_ADD, requireAdmin, function (req, res) {
        res.render(views.ADD_USER, {message: req.flash('sign_upMessage')});
    });

    app.post(routes.SIGN_UP, requireAdmin, async function (req, res) {
        await controllers.user.set.new(req, res);
    });

    app.post(routes.USER_EDIT, requireAdmin, async function (req, res) {
        await controllers.user.set.existing(req, res);
    });

    app.get(routes.USER_MANAGEMENT, requireAdmin, async function (req, res) {
        await controllers.user.get.all(req, res);
    });

    app.post(routes.USER_DELETE, requireAdmin, async function (req, res) {
        await controllers.user.delete.one(req, res);
    });

    app.get(routes.FILTER, isLoggedIn, async function (req, res) {
        await controllers.registrationData.get.all(req, res);
    });

    app.get(routes.AGE, isLoggedIn, async function (req, res) {
        await controllers.registrationData.get.age(req, res);
    });

    app.get(routes.FOOD_RESTRICTIONS, requireAdmin, async function (req, res) {
        await controllers.registrationData.get.food(req, res);
    });

    app.get(routes.PRIMER, requireAdmin, async function (req, res) {
        await controllers.registrationData.get.primer(req, res);
    });

    app.get(routes.MEDICAL, requireAdmin, async function (req, res) {
        await controllers.registrationData.get.medical(req, res);
    });

    app.get(routes.PRONOUNS, requireAdmin, async function (req, res) {
        await controllers.registrationData.get.pronouns(req, res);
    });

    app.get(routes.ACCESSIBILITY, requireAdmin, async function (req, res) {
        await controllers.registrationData.get.accessibility(req, res);
    });

    app.get(routes.PAY_PERSON, isLoggedIn, async function (req, res) {
        await controllers.registrationData.get.payPerson(req, res);
    });

    app.get(routes.PAY_MAIL, isLoggedIn, async function (req, res) {
        await controllers.registrationData.get.payMail(req, res);
    });

    app.get(routes.PAY_ONLINE, isLoggedIn, async function (req, res) {
        await controllers.registrationData.get.payOnline(req, res);
    });

    app.get(routes.UNPAID, isLoggedIn, async function (req, res) {
        await controllers.registrationData.get.unpaid(req, res);
    });

    app.get(routes.SEARCH, isLoggedIn, async function (req, res) {
        await controllers.search.get.general(req, res);
    });

    app.get(routes.NET_ID, isLoggedIn, async function (req, res) {
        await controllers.search.get.netid(req, res);
    });

    app.get(routes.EXPORT, requireAdmin, async function (req, res) {
        await controllers.registrationData.get.excelFile(req, res);
    });

    app.get(routes.ALL_GROUPS, requireAdmin, async function (req, res) {
        await controllers.groups.get.all(req, res);
    });

    app.post(routes.ONE_GROUP, requireAdmin, async function (req, res) {
        await controllers.groups.get.one(req, res);
    });

    app.post(routes.UPDATE_MAX_NUM_GROUPS, requireAdmin, async function (req, res) {
        await controllers.groups.set.number(req, res);
    });

    app.post(routes.ASSIGN, requireAdmin, async function (req, res) {
        await controllers.groups.set.all(req, res);
    });

    app.post(routes.CLEAR_GROUPS, requireAdmin, async function (req, res) {
        await controllers.groups.delete.all(req, res);
    });

    app.get(routes.ERROR, isLoggedIn, function (req, res) {
        res.render(views.ERROR, {errorMessage: "You don't have the privileges to see this."});
    });

    app.post(routes.GROUP_NUMBER_EDIT, requireAdmin, async function (req, res) {
        await controllers.groups.set.one(req, res);
    });

    app.get(routes.LOGOUT, function (req, res) {
        req.logout();
        res.redirect(routes.HOME);
    });
};

function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        logger.info(req.user.email + " going to " + req.originalUrl);
        return next();
    } else {
        logger.warn("User attempted access to " + req.originalUrl + " without session");
        res.redirect("/login");
    }
}

function requireAdmin(req, res, next) {
    if (!req.isAuthenticated()) {
        logger.warn("User attempted to access privileged " + req.originalUrl + " without session");
        res.redirect("/login");
    } else if (req.user && req.user.isAdmin) {
        logger.info(req.user.email + " going to " + req.originalUrl + " with admin privileges");
        return next();
    } else {
        logger.warn("User attempted to access privileged " + req.originalUrl + " without admin privileges");
        res.redirect("/error");
    }
}