const mysql = require('mysql');
const PropertiesReader = require('properties-reader');
const constants = require("./dbConstants");
const util = require("../../server/util");

const tables = constants.tables;
const queries = constants.queries;
const properties = PropertiesReader(__dirname + "/db_properties.ini");

let con = mysql.createConnection({
    host: properties.get('host'),
    user: properties.get('user'),
    password: properties.get('password'),
    database: properties.get('database')
});

exports.connect = function () {
    con.connect(function (err) {
        if (err) throw err;
    });
};

exports.query = function (queryString, params, callback) {
    con.query(queryString, params, function (err, rows) {
        callback(err, rows);
    });
};

exports.selectAll = function (table, callback) {
    query(buildSimpleTableQuery(queries.SELECT_ALL, table), table, [], callback);
};

exports.deleteAll = function (table, callback) {
    query(buildSimpleTableQuery(queries.DELETE_ALL, table), table, [], callback);
};

exports.insert = function (table, columns, values, callback) {
    if (columns instanceof Array && values instanceof Array && columns.length === values.length) {
        query(buildInsertQuery(table, columns), table, values, callback);
    } else {
        callback("Insert failed; poorly formed columns and values");
    }
};

exports.updateAllColumns = function (table, columns, values, callback) {
    if (columns instanceof Array && values instanceof Array && columns.length === values.length) {
        query(buildUpdateQuery(table, columns), table, values, callback);
    } else {
        callback("Update failed: poorly formed columns and values")
    }
};

function buildUpdateQuery(table, columns) {
    let queryString = queries.UPDATE + " " + table + " SET ";
    for (let i = 0; i < columns.length; i++) {
        queryString += (columns[i] + "=?");
        if (i < columns.length - 1) {
            //add comma if not last item
            queryString += ",";
        }
    }
    return queryString;
}

function buildInsertQuery(table, columns) {
    let columnsString = queries.INSERT + " " + table + " (";
    let paramsString = "VALUES (";
    for (let i = 0; i < columns.length; i++) {
        columnsString += columns[i];
        paramsString += "?";
        if (i < columns.length - 1) {
            //not last item, so add comma
            columnsString += ",";
            paramsString += ",";
        }
    }
    columnsString += ") ";
    paramsString += ")";
    return columnsString.concat(" ", paramsString);
}

function buildSimpleTableQuery(query, table) {
    return query + " " + table;
}

function query(queryString, table, params, callback) {
    if (util.valInObj(table, tables)) {
        makeQuery(queryString, params, callback);
    } else {
        callback("Query failed: " + table + " is not a table in the database");
    }
}

function makeQuery(queryString, params, callback) {
    con.query(queryString, params, function (err, rows) {
        callback(err, rows);
    });
}