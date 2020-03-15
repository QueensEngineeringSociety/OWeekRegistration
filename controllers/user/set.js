const util = require("../controllerUtil");
const User = require("../../models/user");
const db = util.db;

const strongPassRegex = new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[^[0-9a-zA-Z])(?=.{8,})");
const errPasswordReq = "That password doesn't match the requirements: 1 lowercase, uppercase, number, special character and at least 8 characters long";

exports.new = async function (firstName, lastName, username, password, isAdmin) {
    return await util.execute("set", "new user", false, util.routes.USER_MANAGEMENT, async function () {
        await setUserInfo(db.insert, false, "That username already exists", firstName, lastName, username, password, isAdmin);
    });
};

exports.existing = async function (firstName, lastName, username, password, isAdmin) {
    return await util.execute("set", "edit user", false, util.routes.USER_MANAGEMENT, async function () {
        await setUserInfo(db.updateWhereClause, true, "That username doesn't exist", firstName, lastName, username, password, isAdmin);
    });
};

async function setUserInfo(dbQueryFunction, isEditUser, rowCondErrMessage, firstName, lastName, username, password, isAdmin) {
    let rows = await db.selectWhereClause("users", "username", username);
    if (isEditUser ^ rows.length) { //allows isEditUser to control if we want rows.length as true or false for this condition
        throw new Error(rowCondErrMessage);
    } else if (isPasswordNotStrong(password)) {
        throw new Error(errPasswordReq);
    } else {
        let user = new User(firstName, lastName, username, password, isAdmin);
        if (isEditUser) {
            await dbQueryFunction("users", ["first_name", "last_name", "password", "isAdmin"], [user.first_name, user.last_name, user.password, user.isAdmin], "username", rows[0].username);
        } else {
            await dbQueryFunction("users", ["first_name", "last_name", "username", "password", "isAdmin"], [user.first_name, user.last_name, user.username, user.password, user.isAdmin]);
        }
    }
}

function isPasswordNotStrong(password) {
    return !strongPassRegex.test(password);
}