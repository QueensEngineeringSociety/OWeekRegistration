const util = require("../controllerUtil");

exports.cleared = async function (request) {
    return await util.execute("Could not logout", false, util.routes.LOGIN, async function () {
        request.logout();
    });
};

exports.authenticate = function (passport,req,res,next) {
    passport.authenticate('local-login', {
        successRedirect: util.routes.FILTER,
        failureRedirect: util.routes.LOGIN
    })(req,res,next);
};