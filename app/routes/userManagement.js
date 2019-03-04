const dbConn = require("../../config/database.js");
const User = require("../../app/models/user");

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
    dbConn.query("SELECT * FROM users WHERE email = ?", [request.body.email], function (err, rows) {
        if (err) {
            console.log("ERROR: " + err);
        }
        if (rows.length) {
            result.render('error.ejs', {errorMessage: "That email already exists"});
        } else if (!strongPassRegex.test(request.body.password)) {
            result.render('error.ejs', {errorMessage: "That password doesn't match the requirements: 1 lowercase, uppercase, number, special character and at least 8 characters long"});
        } else {
            // if there is no user with that username, then create that user
            let newUser = new User(request.body.first_name, request.body.last_name, request.body.email, request.body.password, request.body.is_admin === "admin");
            let insertQuery = "INSERT INTO users (first_name,last_name,email,password,created,is_admin) values (?,?,?,?,?,?);";
            dbConn.query(insertQuery, [newUser.first_name, newUser.last_name, newUser.email, newUser.password, newUser.created, newUser.is_admin],
                function (err, rows) {
                    if (err)
                        console.log("ERROR: " + err);
                    newUser.id = rows.insertId;
                    result.render('users.ejs', {message: request.flash('signupMessage')});
                });
        }
    });
}

function postEdit(request, result) {
    dbConn.query("SELECT * FROM users WHERE email = ?", [request.body.email], function (err, rows) {
        if (err) {
            console.log("ERROR: " + err);
        }
        if (!rows.length) {
            result.render('error.ejs', {errorMessage: "That email doesn't exist"});
        } else if (!strongPassRegex.test(request.body.password)) {
            result.render('error.ejs', {errorMessage: "That password doesn't match the requirements: 1 lowercase, uppercase, number, special character and at least 8 characters long"});
        } else {
            let replacementUser = new User(request.body.first_name, request.body.last_name, request.body.email, request.body.password, request.body.is_admin === "admin");
            let query = "UPDATE users SET first_name=?, last_name=?,email=?,password=?,is_admin=? WHERE id=?;";
            dbConn.query(query, [replacementUser.first_name, replacementUser.last_name, replacementUser.email, replacementUser.password, replacementUser.is_admin, rows[0].id],
                function (err, rows) {
                    if (err)
                        console.log("ERROR: " + err);
                    replacementUser.id = rows.insertId;
                    result.render('users.ejs', {message: request.flash('signupMessage')});
                });
        }
    });
}

function getDelete(request, result) {
    dbConn.query("SELECT * FROM users", [], function (err, rows) {
        if (err) {
            console.log("ERROR: " + err);
        }
        if (!rows.length) {
            result.render('error.ejs', {errorMessage: "That email doesn't exist"});
        } else {
            result.render('deleteusers.ejs', {
                message: request.flash('signupMessage'),
                users: rows
            });
        }
    });
}

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
        dbConn.query("SELECT * FROM users", [], function (err, rows) {
            if (err) {
                console.log("ERROR: " + err);
            }
            if (!rows.length) {
                result.render('error.ejs', {errorMessage: "There are no users!"});
            } else {
                result.render('deleteusers.ejs', {
                    message: request.flash('signupMessage'),
                    users: rows
                });
            }
        });
    });
}