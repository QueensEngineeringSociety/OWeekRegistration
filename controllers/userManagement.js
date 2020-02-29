const dbConn = require("../models/database/queries.js");
const User = require("../models/user");
const constants = require("../server/util");
const view = require("./rendering");

const views = constants.views;
const strongPassRegex = RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})");

const errPasswordReq = "That password doesn't match the requirements: 1 lowercase, uppercase, number, special character and at least 8 characters long";

exports.get = {
    delete: getDelete,
};

exports.post = {
    signUp: postSignUp,
    edit: postEdit,
    delete: postDelete
};

function postSignUp(request, result) {
    addUserInfo(request, result, dbConn.insert, false, "That email already exists");
}

function postEdit(request, result) {
    addUserInfo(request, result, dbConn.updateWhereClause, true, "That email doesn't exist");
}

function addUserInfo(request, result, dbQuery, isEditUser, rowCondErrMessage) {
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
    let user = new User(request.body.first_name, request.body.last_name, request.body.email, request.body.password, request.body.is_admin === "admin");
    queryFunction("users", ["first_name", "last_name", "email", "password", "is_admin"],
        [user.first_name, user.last_name, user.email, user.password, user.is_admin],
        function (err, rows) {
            user.id = rows.insertId;
            view.simpleRender(result, views.USERS);
        });
}

function makeEditUserQuery(request, result, queryFunction, rows) {
    let user = new User(request.body.first_name, request.body.last_name, request.body.email, request.body.password, request.body.is_admin === "admin");
    queryFunction("users", ["first_name", "last_name", "email", "password", "is_admin"],
        [user.first_name, user.last_name, user.email, user.password, user.is_admin], "id", rows[0].id,
        function (err, rows) {
            user.id = rows.insertId;
            view.simpleRender(result, views.USERS);
        });
}

function getDelete(request, result) {
    dbConn.selectAll("users", function (err, rows) {
        if (!rows.length) {
            view.renderError(result, "That email doesn't exist");
        } else {
            result.render(views.DELETE_USERS, {
                message: request.flash('signupMessage'),
                users: rows
            });
        }
    });
}

function postDelete(request, result) {
    let queryString = "";
    if (typeof request.body.users === "object") {
        let test = request.body.users.join("','");
        queryString = "DELETE FROM users WHERE email IN('" + request.body.users.join("','") + "')";
    } else {
        //just one user, no join
        queryString = "DELETE FROM users WHERE email IN('" + request.body.users + "')";
    }
    dbConn.query(queryString, [], function () {
        dbConn.selectAll("users", function (err, rows) {
            if (!rows.length) {
                view.renderError(result, "There are no users!");
            } else {
                result.render(views.DELETE_USERS, {
                    message: request.flash('signupMessage'),
                    users: rows
                });
            }
        });
    });
}

function isPasswordNotStrong(password) {
    return !strongPassRegex.test(password);
}