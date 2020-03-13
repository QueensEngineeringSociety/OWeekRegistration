const util = require("../controllerUtil");
const db = util.db;
const view = util.view;

exports.all = function (request, result) {
    db.updateAllColumns("groupMetaData", ["manGroupNum", "womanGroupNum"], [0, 0], function (err) {
        if (err) {
            view.renderError(result, "Could not getDelete any group data");
        } else {
            db.query("DELETE FROM groupData", function (err) {
                if (err) {
                    view.renderError(result, "Cleared metadata and groups, but couldn't getDelete group data. Contact DoIT.");
                } else {
                    db.query("DELETE FROM groups", function (err) {
                        if (err) {
                            view.renderError(result, "Cleared metadata, but couldn't getDelete groups. Contact DoIT.");
                        } else {
                            result.redirect(util.routes.ALL_GROUPS);
                        }
                    });
                }
            });
        }
    });
};