const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require("bcryptjs");

const dbConn = require('../../models/database/queries.js');

module.exports = function (passport) {

    passport.serializeUser(function (user, done) {
        done(null, user.username);
    });

    passport.deserializeUser(async function (username, done) {
        let rows = await dbConn.query("select * from users where username = ?", [username]);
        done(null, rows[0]);
    });

    passport.use(
        'local-login',
        new LocalStrategy({
                usernameField: 'username',
                passwordField: 'password',
                passReqToCallback: true
            },
            async function (req, username, password, done) {
                let rows = await dbConn.query("SELECT * FROM users WHERE username = ?", [username]);
                if (!rows.length || !bcrypt.compareSync(password, rows[0].password)) {
                    return done(null, false);
                }
                return done(null, rows[0]);
            })
    );
};