exports.select = function (fields, tableName, whereFieldEqual) {
    let q = "SELECT ";
    if (fields === "*") {
        q += "* ";
    } else {
        for (let i = 0; i < fields.length - 1; i++) {
            q += fields[i] + ", ";
        }
        q += fields[fields.length - 1];
    }
    q += (" FROM " + tableName);
    if (whereFieldEqual) {
        q += " WHERE ";
        if (Array.isArray(whereFieldEqual)) {
            for (let i = 0; i < whereFieldEqual.length - 1; i++) {
                q += whereFieldEqual[i] + "=? AND ";
            }
            q += whereFieldEqual[whereFieldEqual.length - 1] + "=?";
        } else {
            q += whereFieldEqual + "=?";
        }
    }
    return q;
};

exports.insert = function (tableName, fields, onDuplicateKeyUpdateFields) {
    let q = "INSERT INTO " + tableName + " (";
    for (let i = 0; i < fields.length - 1; i++) {
        q += fields[i] + ",";
    }
    q += fields[fields.length - 1] + ") VALUES(";
    for (let i = 0; i < fields.length - 1; i++) {
        q += "?,"
    }
    q += "?)";
    if (onDuplicateKeyUpdateFields) {
        q += " ON DUPLICATE KEY UPDATE ";
        for (let i = 0; i < onDuplicateKeyUpdateFields.length - 1; i++) {
            q += onDuplicateKeyUpdateFields[i] + "=?, ";
        }
        q += onDuplicateKeyUpdateFields[onDuplicateKeyUpdateFields.length - 1] + "=?";
    }
    return q;
};

exports.update = function (tableName, fields, whereFieldEqual) {
    let q = "UPDATE " + tableName + " SET ";
    for (let i = 0; i < fields.length - 1; i++) {
        q += (fields[i] + "=?, ");
    }
    q += fields[fields.length - 1] + "=? WHERE ";
    if (Array.isArray(whereFieldEqual)) {
        for (let i = 0; i < whereFieldEqual.length - 1; i++) {
            q += whereFieldEqual[i] + "=?, ";
        }
        q += whereFieldEqual[whereFieldEqual.length - 1] + "=? ";
    } else {
        q += whereFieldEqual + "=?";
    }
    return q;
};

exports.delete = function (table, filterFields) {
    let q = "DELETE FROM " + table + " WHERE ";
    for (let i = 0; i < filterFields.length - 1; i++) {
        q += filterFields[i] + "=? AND ";
    }
    q += filterFields[filterFields.length - 1] + "=?";
    return q;
};