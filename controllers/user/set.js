const util = require("../controllerUtil");
const User = require("../../models/user");
const db = util.db;
const view = util.view;

const strongPassRegex = new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[^[0-9a-zA-Z])(?=.{8,})");
const errPasswordReq = "That password doesn't match the requirements: 1 lowercase, uppercase, number, special character and at least 8 characters long";

exports.new = async function (request, result) {
    await setUserInfo(request, result, db.insert, false, "That email already exists");
};

exports.existing = async function (request, result) {
    await setUserInfo(request, result, db.updateWhereClause, true, "That email doesn't exist");
};

async function setUserInfo(request, result, dbQuery, isEditUser, rowCondErrMessage) {
    let rows = await db.selectWhereClause("users", "email", request.body.email);
    if (isEditUser ^ rows.length) { //allows isEditUser to control if we want rows.length as true or false for this condition
        view.renderError(result, rowCondErrMessage);
    } else if (isPasswordNotStrong(request.body.password)) {
        view.renderError(result, errPasswordReq);
    } else if (isEditUser) {
        await makeEditUserQuery(request, result, dbQuery, rows);
    } else {
        await makeCreateUserQuery(request, result, dbQuery);
    }
}

async function makeCreateUserQuery(request, result, queryFunction) {
    let user = new User(request.body.first_name, request.body.last_name, request.body.email, request.body.password, request.body.isAdmin === "admin");
    await queryFunction("users", ["first_name", "last_name", "email", "password", "isAdmin"], [user.first_name, user.last_name, user.email, user.password, user.isAdmin]);
    result.redirect(util.routes.USER_MANAGEMENT);
}

async function makeEditUserQuery(request, result, queryFunction, rows) {
    let user = new User(request.body.first_name, request.body.last_name, request.body.email, request.body.password, request.body.isAdmin === "admin");
    await queryFunction("users", ["first_name", "last_name", "email", "password", "isAdmin"], [user.first_name, user.last_name, user.email, user.password, user.isAdmin], "id", rows[0].id);
    result.redirect(util.routes.USER_MANAGEMENT);
}

function isPasswordNotStrong(password) {
    return !strongPassRegex.test(password);
}