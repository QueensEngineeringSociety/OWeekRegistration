const dbConn = require("../../config/database/queries.js");
const User = require("../../app/models/user");
const constants = require("../../server/util");
const view = require("./rendering");

const views = constants.views;
const strongPassRegex = RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\\$%\\^&\\*])(?=.{8,})");

exports.get = {
    delete: getDelete,
};

exports.post = {
    signUp: postSignUp,
    edit: postEdit,
    delete: postDelete
};

function postSignUp(request, result) {
    dbConn.selectWhereClause("users", "email", request.body.email, function (err, rows) {
        if (rows.length) {
            view.renderError(result, "That email already exists");
        } else if (!strongPassRegex.test(request.body.password)) {
            view.renderError(result, "That password doesn't match the requirements: 1 lowercase, uppercase, number, special character and at least 8 characters long"
            )
            ;
        } else {
            // if there is no user with that username, then create that user
            let newUser = new User(request.body.first_name, request.body.last_name, request.body.email, request.body.password, request.body.is_admin === "admin");
            dbConn.insert("users", ["first_name", "last_name", "email", "password", "created", "is_admin"],
                [newUser.first_name, newUser.last_name, newUser.email, newUser.password, newUser.created, newUser.is_admin],
                function (err, rows) {
                    newUser.id = rows.insertId;
                    view.simpleRender(result, views.USERS);
                });
        }
    });
}

function postEdit(request, result) {
    dbConn.selectWhereClause("users", "email", request.body.email, function (err, rows) {
        if (!rows.length) {
            view.renderError(result, "That email doesn't exist");
        } else if (!strongPassRegex.test(request.body.password)) {
            view.renderError(result, "That password doesn't match the requirements: 1 lowercase, uppercase, number, special character and at least 8 characters long");
        } else {
            let replacementUser = new User(request.body.first_name, request.body.last_name, request.body.email, request.body.password, request.body.is_admin === "admin");
            dbConn.updateWhereClause("users", ["first_name", "last_name", "email", "password", "is_admin"],
                [replacementUser.first_name, replacementUser.last_name, replacementUser.email, replacementUser.password, replacementUser.is_admin], "id", rows[0].id,
                function (err, rows) {
                    replacementUser.id = rows.insertId;
                    view.simpleRender(result, views.USERS);
                });
        }
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

//TODO not working to delete user
function postDelete(request, result) {
    let queryString = "";
    if (typeof request.body.users.length === "object") {
        queryString = "DELETE FROM users WHERE email IN('" + request.body.users.join("','") + "')";
    } else {
        //just one user, no join
        queryString = "DELETE FROM users WHERE email IN('" + request.body.users + "')";
    }
    dbConn.query(queryString, [], function (topErr) {
        if (topErr) {
            console.log("ERROR: " + topErr);
        }
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