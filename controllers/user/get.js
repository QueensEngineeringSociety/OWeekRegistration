const util = require("../controllerUtil");
const db = util.db;

exports.all = async function () {
    return await util.execute("get", "all users", true, util.views.MANAGE_USERS, async function () {
        let rows = await db.selectAllUsers();
        return {data: {users: rows}};
    });
};