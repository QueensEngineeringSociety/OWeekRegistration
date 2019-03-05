const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require("bcrypt-nodejs");

const dbConn = require('./database/queries.js');

module.exports = function (passport) {

    passport.serializeUser(function (user, done) {
        done(null, user.id);
    });

    passport.deserializeUser(function (id, done) {
        dbConn.query("select * from users where id = ?", [id], function (err, rows) {
            done(err, rows[0]);
        });
    });


    // =========================================================================
    // LOCAL SIGN-UP ============================================================
    // =========================================================================
    // we are using named strategies since we have one for login and one for signup
    // by default, if there was no name, it would just be called 'local'
/* not needed unless doing individual sign up not by admin
    passport.use(
        'local-signup',
        new LocalStrategy({
                // by default, local strategy uses username and password, we will override with email
                usernameField: 'email',
                passwordField: 'password',
                passReqToCallback: true // allows us to pass back the entire request to the callback
            },
            function (req, email, password, done) {
                // find a user whose email is the same as the forms email
                // we are checking to see if the user trying to login already exists
                dbConn.query("SELECT * FROM users WHERE email = ?", [email], function (err, rows) {
                    if (err) {
                        console.log("ERROR: " + err);
                        return done(err);
                    }
                    if (rows.length) {
                        return done(null, false, req.flash('signupMessage', 'That email is already taken.'));
                    } else {
                        // if there is no user with that username, then create that user
                        var newUser = new User(req.body.first_name, req.body.last_name, email, password, req.body.is_admin === "admin");
                        var insertQuery = "INSERT INTO users (first_name,last_name,email,password,created,is_admin) values (?,?,?,?,?,?);";
                        dbConn.query(insertQuery, [newUser.first_name, newUser.last_name, newUser.email, newUser.password, newUser.created, newUser.is_admin],
                            function (err, rows) {
                                if (err)
                                    console.log("ERROR: " + err);
                                newUser.id = rows.insertId;
                                return done(null, newUser);
                            });
                    }
                });
            })
    );*/

    // =========================================================================
    // LOCAL LOGIN =============================================================
    // =========================================================================
    // we are using named strategies since we have one for login and one for signup
    // by default, if there was no name, it would just be called 'local'

    passport.use(
        'local-login',
        new LocalStrategy({
                // by default, local strategy uses username and password, we will override with email
                usernameField: 'email',
                passwordField: 'password',
                passReqToCallback: true // allows us to pass back the entire request to the callback
            },
            function (req, email, password, done) { // callback with email and password from our form
                dbConn.query("SELECT * FROM users WHERE email = ?", [email], function (err, rows) {
                    if (err)
                        return done(err);
                    //wrong email or password
                    if (!rows.length || !bcrypt.compareSync(password, rows[0].password)) {
                        return done(null, false, req.flash('loginMessage', 'Incorrect login info.')); // req.flash is the way to set flash data using connect-flash
                    }
                    // all is well, return successful user
                    return done(null, rows[0]);
                });
            })
    );
};