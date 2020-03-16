const util = require("../controllerUtil");
const db = util.db;

exports.one = async function (curUsername, toDeleteUsername) {
    return await util.execute(`Could not delete user ${toDeleteUsername}`, true, util.views.MANAGE_USERS, async function () {
        if (curUsername === toDeleteUsername) {
            throw new Error("You can't delete yourself!");
        }
        await db.delete.user(toDeleteUsername);
        let rows = await db.get.allUsers();
        if (!rows.length) {
            throw new Error("There are no users!");
        }
        return {data: {users: users}};
    });
};