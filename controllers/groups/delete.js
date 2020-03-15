const util = require("../controllerUtil");
const db = util.db;

exports.all = async function () {
    return await util.execute("delete","all groups", false, util.routes.ALL_GROUPS, async function () {
        await db.updateAllColumns("groupMetaData", ["manGroupNum", "womanGroupNum"], [0, 0]);
        await db.query("DELETE FROM groupData");
        await db.query("DELETE FROM groups");
    });
};