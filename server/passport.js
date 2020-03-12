const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require("bcrypt-nodejs");

const dbConn = require('../models/database/queries.js');

module.exports = function (passport) {

    passport.serializeUser(function (user, done) {
        done(null, user.id);
    });

    passport.deserializeUser(function (id, done) {
        dbConn.query("select * from users where id = ?", [id], function (err, rows) {
            done(err, rows[0]);
        });
    });

    passport.use(
        'local-login',
        new LocalStrategy({
                // by default, local strategy uses username and password, we will override with email
                usernameField: 'email',
                passwordField: 'password',
                passReqToCallback: true
            },
            function (req, email, password, done) {
                dbConn.query("SELECT * FROM users WHERE email = ?", [email], function (err, rows) {
                    if (err)
                        return done(err);
                    if (!rows.length || !bcrypt.compareSync(password, rows[0].password)) {
                        return done(null, false, req.flash('loginMessage', 'Incorrect login info.')); // req.flash is the way to set flash data using connect-flash
                    }
                    return done(null, rows[0]);
                });
            })
    );
};