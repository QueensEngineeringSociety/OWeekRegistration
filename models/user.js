let bcrypt = require("bcrypt-nodejs");

module.exports = User;

function User(firstName, lastName, email, password, isAdmin) {
    this.first_name = firstName;
    this.last_name = lastName;
    this.email = email;
    this.password = bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
    this.isAdmin = isAdmin;
}