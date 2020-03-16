const util = require("../controllerUtil");
const db = util.db;

exports.all = async function () {
    return await util.execute("delete", "all groups", false, util.routes.ALL_GROUPS, async function () {
        await db.set.groupNumberCounters(0, 0);
        await db.query("DELETE FROM groupData");
        await db.query("DELETE FROM groups");
    });
};