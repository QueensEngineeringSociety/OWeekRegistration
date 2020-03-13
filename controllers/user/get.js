const util = require("../controllerUtil");
const db = util.db;
const view = util.view;

exports.all = async function (request, result) {
    let rows = await db.selectAllUsers();
    if (!rows.length) {
        view.renderError(result, "That email doesn't exist");
    } else {
        result.render(util.views.MANAGE_USERS, {
            message: request.flash('sign_upMessage'),
            users: rows
        });
    }
};