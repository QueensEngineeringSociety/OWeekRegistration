const util = require("../controllerUtil");
const db = util.db;
const view = util.view;

exports.one = async function (request, result) {
    let queryString = "DELETE FROM users WHERE email=?";
    await db.query(queryString, [request.body.email]);
    let rows = await db.selectAll("users");
    if (!rows.length) {
        view.renderError(result, "There are no users!");
    } else {
        result.render(util.views.MANAGE_USERS, {
            message: request.flash('sign_upMessage'),
            users: rows
        });
    }
};