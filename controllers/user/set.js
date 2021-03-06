const util = require("../controllerUtil");
const User = require("../../models/user");
const db = util.db;

const strongPassRegex = new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[^[0-9a-zA-Z])(?=.{8,})");
const errPasswordReq = "That password doesn't match the requirements: 1 lowercase, uppercase, number, special character and at least 8 characters long";

exports.new = async function (firstName, lastName, username, password, isAdmin) {
    return await util.execute(`Could not add new user ${username}`, false, util.routes.USER_MANAGEMENT, async function () {
        await setUserInfo(false, "That username already exists", firstName, lastName, username, password, isAdmin);
    });
};

exports.existing = async function (firstName, lastName, username, password, isAdmin) {
    return await util.execute(`Could not edit ${username}`, false, util.routes.USER_MANAGEMENT, async function () {
        await setUserInfo(true, "That username doesn't exist", firstName, lastName, username, password, isAdmin);
    });
};

async function setUserInfo(isEditUser, rowCondErrMessage, firstName, lastName, username, password, isAdmin) {
    let rows = await db.get.user(username);
    if (isEditUser ^ rows.length) { //allows isEditUser to control if we want rows.length as true or false for this condition
        throw new Error(rowCondErrMessage);
    } else if (isPasswordNotStrong(password)) {
        throw new Error(errPasswordReq);
    } else {
        let user = new User(firstName, lastName, username, password, isAdmin);
        await db.set.user(user);
    }
}

function isPasswordNotStrong(password) {
    return !strongPassRegex.test(password);
}