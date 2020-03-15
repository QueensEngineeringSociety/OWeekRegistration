const util = require("../controllerUtil");
const User = require("../../models/user");
const db = util.db;
//TODO remove ID field, just use email as key
const strongPassRegex = new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[^[0-9a-zA-Z])(?=.{8,})");
const errPasswordReq = "That password doesn't match the requirements: 1 lowercase, uppercase, number, special character and at least 8 characters long";

exports.new = async function (firstName, lastName, email, password, isAdmin) {
    return await util.execute("set", "new user", false, util.routes.USER_MANAGEMENT, async function () {
        await setUserInfo(db.insert, false, "That email already exists", firstName, lastName, email, password, isAdmin);
    });
};

exports.existing = async function (firstName, lastName, email, password, isAdmin) {
    return await util.execute("set", "edit user", false, util.routes.USER_MANAGEMENT, async function () {
        await setUserInfo(db.insert, true, "That email doesn't exist", firstName, lastName, email, password, isAdmin);
    });
};

async function setUserInfo(dbQueryFunction, isEditUser, rowCondErrMessage, firstName, lastName, email, password, isAdmin) {
    let rows = await db.selectWhereClause("users", "email", email);
    if (isEditUser ^ rows.length) { //allows isEditUser to control if we want rows.length as true or false for this condition
        throw new Error(rowCondErrMessage);
    } else if (isPasswordNotStrong(password)) {
        throw new Error(errPasswordReq);
    } else {
        let user = new User(firstName, lastName, email, password, isAdmin);
        if (isEditUser) {
            await dbQueryFunction("users", ["first_name", "last_name", "email", "password", "isAdmin"], [user.first_name, user.last_name, user.email, user.password, user.isAdmin], "id", rows[0].id);
        } else {
            await dbQueryFunction("users", ["first_name", "last_name", "email", "password", "isAdmin"], [user.first_name, user.last_name, user.email, user.password, user.isAdmin]);
        }
    }
}

function isPasswordNotStrong(password) {
    return !strongPassRegex.test(password);
}