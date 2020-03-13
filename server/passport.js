const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require("bcrypt-nodejs");

const dbConn = require('../models/database/queries.js');

module.exports = function (passport) {

    passport.serializeUser(function (user, done) {
        done(null, user.id);
    });

    passport.deserializeUser(async function (id, done) {
        let rows = await dbConn.query("select * from users where id = ?", [id]);
        done(null, rows[0]);
    });

    passport.use(
        'local-login',
        new LocalStrategy({
                // by default, local strategy uses username and password, we will override with email
                usernameField: 'email',
                passwordField: 'password',
                passReqToCallback: true
            },
            async function (req, email, password, done) {
                let rows = await dbConn.query("SELECT * FROM users WHERE email = ?", [email]);
                if (!rows.length || !bcrypt.compareSync(password, rows[0].password)) {
                    return done(null, false, req.flash('loginMessage', 'Incorrect login info.'));
                }
                return done(null, rows[0]);
            })
    );
};