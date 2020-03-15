const util = require("../controllerUtil");
const db = util.db;

exports.one = async function (email) {
    //TODO ensure not deleting self
    return await util.execute("delete", "user", true, util.views.MANAGE_USERS, async function () {
        let queryString = "DELETE FROM users WHERE email=?";
        await db.query(queryString, [email]);
        let rows = await db.selectAll("users");
        if (!rows.length) {
            throw new Error("There are no users!");
        }
        return {data: {users: users}};
    });
};