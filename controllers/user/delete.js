const util = require("../controllerUtil");
const db = util.db;

exports.one = async function (curUsername, toDeleteUsername) {
    return await util.execute("delete", "user", true, util.views.MANAGE_USERS, async function () {
        if (curUsername === toDeleteUsername) {
            throw new Error("You can't delete yourself!");
        }
        let queryString = "DELETE FROM users WHERE username=?";
        await db.query(queryString, [toDeleteUsername]);
        let rows = await db.get.allUsers();
        if (!rows.length) {
            throw new Error("There are no users!");
        }
        return {data: {users: users}};
    });
};