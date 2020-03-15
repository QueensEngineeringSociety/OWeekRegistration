let bcrypt = require("bcryptjs");

class User {
    constructor(firstName, lastName, username, password, isAdmin) {
        this.first_name = firstName;
        this.last_name = lastName;
        this.username = username;
        this.password = bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
        this.isAdmin = isAdmin;
    }
}

module.exports = User;