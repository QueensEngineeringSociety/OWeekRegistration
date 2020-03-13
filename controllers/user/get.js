const util = require("../controllerUtil");
const db = util.db;
const view = util.view;

exports.all = function(request, result) {
    db.selectAllUsers(function (err, rows) {
        if (!rows.length) {
            view.renderError(result, "That email doesn't exist");
        } else {
            result.render(util.views.MANAGE_USERS, {
                message: request.flash('sign_upMessage'),
                users: rows
            });
        }
    });
};