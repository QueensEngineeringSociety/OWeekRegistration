const util = require("../controllerUtil");
const db = util.db;

exports.all = async function (request, result) {
    await db.updateAllColumns("groupMetaData", ["manGroupNum", "womanGroupNum"], [0, 0]);
    await db.query("DELETE FROM groupData");
    await db.query("DELETE FROM groups");
    result.redirect(util.routes.ALL_GROUPS);
};