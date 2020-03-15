const controllers = require("../controllers");
const constants = require("./util");
const logger = require("./logger")(__filename);
const routes = constants.routes;
const views = constants.views;

module.exports = function (app, passport) {
    app.get(routes.LOGIN, async function (req, res) {
        await executeRequest(req, res, async function () {
            return await controllers.session.display.login(req.user);
        });
    });

    app.post(routes.LOGIN, function (req, res, next) {
        controllers.session.set.authenticate(passport, req, res, next);
    });

    app.get(routes.USER_ADD, requireAdmin, async function (req, res) {
        await executeRequest(req, res, async function () {
            return await controllers.user.display.add();
        })
    });

    app.post(routes.SIGN_UP, requireAdmin, async function (req, res) {
        await executeRequest(req, res, async function () {
            return await controllers.user.set.new(req.body.first_name, req.body.last_name, req.body.username, req.body.password, req.body.isAdmin === "admin");
        });
    });

    app.post(routes.USER_EDIT, requireAdmin, async function (req, res) {
        await executeRequest(req, res, async function () {
            return await controllers.user.set.existing(req.body.first_name, req.body.last_name, req.body.username, req.body.password, req.body.isAdmin === "admin");
        });
    });

    app.get(routes.USER_MANAGEMENT, requireAdmin, async function (req, res) {
        await executeRequest(req, res, async function () {
            return await controllers.user.get.all();
        });
    });

    app.post(routes.USER_DELETE, requireAdmin, async function (req, res) {
        await executeRequest(req, res, async function () {
            return await controllers.user.delete.one(req.user.username, req.body.username);
        });
    });

    app.get(routes.FILTER, isLoggedIn, async function (req, res) {
        await executeRequest(req, res, async function () {
            return await controllers.registrationData.get.all(req.query.nextPage, req.query.prevPage);
        });
    });

    app.get(routes.AGE, isLoggedIn, async function (req, res) {
        await executeRequest(req, res, async function () {
            return await controllers.registrationData.get.age(req.query.nextPage, req.query.prevPage);
        });
    });

    app.get(routes.FOOD_RESTRICTIONS, requireAdmin, async function (req, res) {
        await executeRequest(req, res, async function () {
            return await controllers.registrationData.get.food(req.query.nextPage, req.query.prevPage);
        });
    });

    app.get(routes.PRIMER, requireAdmin, async function (req, res) {
        await executeRequest(req, res, async function () {
            return await controllers.registrationData.get.primer(req.query.nextPage, req.query.prevPage);
        });
    });

    app.get(routes.MEDICAL, requireAdmin, async function (req, res) {
        await executeRequest(req, res, async function () {
            return await controllers.registrationData.get.medical(req.query.nextPage, req.query.prevPage);
        });
    });

    app.get(routes.PRONOUNS, requireAdmin, async function (req, res) {
        await executeRequest(req, res, async function () {
            return await controllers.registrationData.get.pronouns(req.query.nextPage, req.query.prevPage);
        });
    });

    app.get(routes.ACCESSIBILITY, requireAdmin, async function (req, res) {
        await executeRequest(req, res, async function () {
            return await controllers.registrationData.get.accessibility(req.query.nextPage, req.query.prevPage);
        });
    });

    app.get(routes.PAY_PERSON, isLoggedIn, async function (req, res) {
        await executeRequest(req, res, async function () {
            return await controllers.registrationData.get.payPerson(req.query.nextPage, req.query.prevPage);
        });
    });

    app.get(routes.PAY_MAIL, isLoggedIn, async function (req, res) {
        await executeRequest(req, res, async function () {
            return await controllers.registrationData.get.payMail(req.query.nextPage, req.query.prevPage);
        });
    });

    app.get(routes.PAY_ONLINE, isLoggedIn, async function (req, res) {
        await executeRequest(req, res, async function () {
            return await controllers.registrationData.get.payOnline(req.query.nextPage, req.query.prevPage);
        });
    });

    app.get(routes.UNPAID, isLoggedIn, async function (req, res) {
        await executeRequest(req, res, async function () {
            return await controllers.registrationData.get.unpaid(req.query.nextPage, req.query.prevPage);
        });
    });

    app.get(routes.EXPORT, requireAdmin, async function (req, res) {
        await executeRequest(req, res, async function () {
            return await controllers.registrationData.get.excelFile(res);
        });
    });

    app.get(routes.SEARCH, isLoggedIn, async function (req, res) {
        await executeRequest(req, res, async function () {
            if (req.query['field'] && req.query['operator'] && req.query['value']) {
                return await controllers.search.get.general(req.query['field'], req.query['operator'], req.query['value']);
            } else {
                throw new Error("Poor search query");
            }
        });
    });

    app.get(routes.NET_ID, isLoggedIn, async function (req, res) {
        await executeRequest(req, res, async function () {
            if (req.query['netid_search']) {
                return await controllers.search.get.netid(req.query['netid_search']);
            } else {
                throw new Error("Poor netid search query");
            }
        });
    });

    app.get(routes.ALL_GROUPS, requireAdmin, async function (req, res) {
        await executeRequest(req, res, async function () {
            return await controllers.groups.get.all();
        });
    });

    app.post(routes.ONE_GROUP, requireAdmin, async function (req, res) {
        await executeRequest(req, res, async function () {
            return await controllers.groups.get.one(req.body.groupNumber);
        });
    });

    app.post(routes.UPDATE_MAX_NUM_GROUPS, requireAdmin, async function (req, res) {
        await executeRequest(req, res, async function () {
            return await controllers.groups.set.number(req.body.updatemax);
        });
    });

    app.post(routes.ASSIGN, requireAdmin, async function (req, res) {
        await executeRequest(req, res, async function () {
            return await controllers.groups.set.all();
        });
    });

    app.post(routes.CLEAR_GROUPS, requireAdmin, async function (req, res) {
        await executeRequest(req, res, async function () {
            return await controllers.groups.delete.all();
        });
    });

    app.post(routes.GROUP_NUMBER_EDIT, requireAdmin, async function (req, res) {
        await executeRequest(req, res, async function () {
            return await controllers.groups.set.one(req.body.new_group_number, req.body.old_group_number, req.body.pronouns, req.body.wufooEntryId);
        });
    });

    app.get(routes.LOGOUT, async function (req, res) {
        await executeRequest(req, res, async function () {
            return await controllers.session.set.cleared(req);
        });
    });
};

function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        logger.info(req.user.username + " going to " + req.originalUrl);
        return next();
    } else {
        logger.warn("User attempted access to " + req.originalUrl + " without session");
        res.redirect(routes.LOGIN);
    }
}

function requireAdmin(req, res, next) {
    if (!req.isAuthenticated()) {
        logger.warn("User attempted to access privileged " + req.originalUrl + " without session");
        res.redirect(routes.LOGIN);
    } else if (req.user && req.user.isAdmin) {
        logger.info(req.user.username + " going to " + req.originalUrl + " with admin privileges");
        return next();
    } else {
        logger.warn("User attempted to access privileged " + req.originalUrl + " without admin privileges");
        res.render(views.ERROR, {errorMessage: "You don't have access to this page"});
    }
}

async function executeRequest(req, res, executorFunction) {
    try {
        let renderObject = await executorFunction();
        if (renderObject.error) {
            res.render(views.ERROR, {errorMessage: renderObject.error});
        } else {
            renderObject.display.isAdmin = req.user ? req.user.isAdmin : false;
            renderObject.display.fields = renderObject.display.isAdmin ? renderObject.display.allFields : renderObject.display.generalFields;
            if (renderObject.isView) {
                renderObject.csrfToken = req.csrfToken();
                res.render(renderObject.target, renderObject);
            } else if (renderObject.isView !== null) {
                res.redirect(renderObject.target);
            }
        }
    } catch (e) {
        logger.error(`${e} : ${e.stack}`);
        res.render(views.ERROR, {errorMessage: "Internal error"});
    }
}