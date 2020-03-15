const util = require("../controllerUtil");

exports.add = function () {
    return util.execute("display", "add user", true, util.views.ADD_USER, async function () {
    });
};