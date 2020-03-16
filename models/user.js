const util = require("./modelUtil");
const bcrypt = require("bcryptjs");

class User {
    constructor(firstName, lastName, username, password, isAdmin) {
        this.first_name = firstName;
        this.last_name = lastName;
        this.username = username;
        this.password = bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
        this.isAdmin = isAdmin;
    }

    static fromDb(rows) {
        let res = util.modelFromDb(rows, function (row) {
            return new User(row.first_name, row.last_name, row.username, row.password, row.isAdmin);
        });
        if (!Array.isArray(res)) {
            //to display in table, this should always be an array
            res = [res];
        }
        return res;
    }

    static getFields() {
        return ["first_name", "last_name", "username", "isAdmin"];
    }

    static keyField() {
        return "username";
    }

    fields() {
        return util.getObjFields(this);
    }

    updateFields() {
        return util.getObjFields(this, User.keyField());
    }

    keyValue() {
        return this.username;
    }

    values() {
        return util.getObjValues(this);
    }

    updateValues() {
        return util.getObjValues(this, User.keyField());
    }
}

module.exports = User;