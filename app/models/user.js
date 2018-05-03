var bcrypt = require("bcrypt-nodejs");

module.exports = User;

function User(firstName, lastName, email, password) {
    this.first_name = firstName;
    this.last_name = lastName;
    this.email = email;
    this.password = bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
    this.created=new Date().toISOString().slice(0, 19).replace('T', ' '); //TODO 4 hours ahead - timezone
}