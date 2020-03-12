const dbConn = require("../models/database/queries.js");
const User = require("../models/user");
const constants = require("../server/util");
const view = require("./rendering");

const views = constants.views;
const routes = constants.routes;
const strongPassRegex = RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[^[0-9a-zA-Z])(?=.{8,})");

const errPasswordReq = "That password doesn't match the requirements: 1 lowercase, uppercase, number, special character and at least 8 characters long";

exports.get = {
    delete: getDelete,
};

exports.post = {
    sign_up: postSignUp,
    edit: postEdit,
    delete: postDelete
};

function postSignUp(request, result) {
    setUserInfo(request, result, dbConn.insert, false, "That email already exists");
}

function postEdit(request, result) {
    setUserInfo(request, result, dbConn.updateWhereClause, true, "That email doesn't exist");
}

function setUserInfo(request, result, dbQuery, isEditUser, rowCondErrMessage) {
    dbConn.selectWhereClause("users", "email", request.body.email, function (err, rows) {
        if (isEditUser ^ rows.length) { //allows isEditUser to control if we want rows.length as true or false for this condition
            view.renderError(result, rowCondErrMessage);
        } else if (isPasswordNotStrong(request.body.password)) {
            view.renderError(result, errPasswordReq);
        } else if (isEditUser) {
            makeEditUserQuery(request, result, dbQuery, rows);
        } else {
            makeCreateUserQuery(request, result, dbQuery);
        }
    });
}

function makeCreateUserQuery(request, result, queryFunction) {
    let user = new User(request.body.first_name, request.body.last_name, request.body.email, request.body.password, request.body.isAdmin === "admin");
    queryFunction("users", ["first_name", "last_name", "email", "password", "isAdmin"],
        [user.first_name, user.last_name, user.email, user.password, user.isAdmin],
        function (err, rows) {
            user.id = rows.insertId;
            result.redirect(routes.USER_MANAGEMENT);
        });
}

function makeEditUserQuery(request, result, queryFunction, rows) {
    let user = new User(request.body.first_name, request.body.last_name, request.body.email, request.body.password, request.body.isAdmin === "admin");
    queryFunction("users", ["first_name", "last_name", "email", "password", "isAdmin"],
        [user.first_name, user.last_name, user.email, user.password, user.isAdmin], "id", rows[0].id,
        function (err, rows) {
            user.id = rows.insertId;
            result.redirect(routes.USER_MANAGEMENT);
        });
}

function getDelete(request, result) {
    dbConn.selectAllUsers(function (err, rows) {
        if (!rows.length) {
            view.renderError(result, "That email doesn't exist");
        } else {
            result.render(views.MANAGE_USERS, {
                message: request.flash('sign_upMessage'),
                users: rows
            });
        }
    });
}

function postDelete(request, result) {
    let queryString = "DELETE FROM users WHERE email=?";
    dbConn.query(queryString, [request.body.email], function () {
        dbConn.selectAll("users", function (err, rows) {
            if (!rows.length) {
                view.renderError(result, "There are no users!");
            } else {
                result.render(views.MANAGE_USERS, {
                    message: request.flash('sign_upMessage'),
                    users: rows
                });
            }
        });
    });
}

function isPasswordNotStrong(password) {
    return !strongPassRegex.test(password);
}