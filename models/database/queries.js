const mysql = require('mysql');
const PropertiesReader = require('properties-reader');
const constants = require("./dbConstants");
const util = require("../../server/util");

//TODO finish building pre-made queries, put queries into model

const tables = constants.tables;
const queries = constants.queries;
const properties = PropertiesReader(__dirname + "/../../config/db_properties.cfg");

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
        if (err) {
            console.log("DB QUERY ERROR: " + err);
        }
        callback(err, rows);
    });
};

exports.selectAll = function (table, callback) {
    query(buildSimpleTableQuery(queries.SELECT_ALL, table), table, [], callback);
};

exports.selectAllUsers = function (callback) {
    query(buildSimpleTableQuery("SELECT id, first_name, last_name, email, isAdmin FROM", "users"), "users", [], callback);
};

exports.selectWhereClause = function (table, whereColumn, whereValue, callback) {
    simpleTableWhereQuery(table, whereColumn, whereValue, queries.SELECT_ALL, callback);
};

exports.deleteWhereClause = function (table, whereColumn, whereValue, callback) {
    simpleTableWhereQuery(table, whereColumn, whereValue, queries.DELETE_ALL, callback);
};

exports.insert = function (table, columns, values, callback) {
    query(buildParameterizedQuery(table, columns, values, "insert", callback), table, values, callback);
};

exports.updateAllColumns = function (table, columns, values, callback) {
    query(buildParameterizedQuery(table, columns, values, "update", callback), table, values, callback);
};

exports.updateWhereClause = function (table, columns, values, whereColumn, whereValue, callback) {
    parameterizedWhereQuery(table, columns, values, whereColumn, whereValue, "update", callback);
};

function parameterizedWhereQuery(table, columns, values, whereColumn, whereValue, type, callback) {
    let queryString = addOneWhereClause(buildParameterizedQuery(table, columns, values, type, callback), whereColumn);
    values.push(whereValue);
    query(queryString, table, values, callback);
}

function simpleTableWhereQuery(table, whereColumn, whereValue, queryString, callback) {
    queryString = addOneWhereClause(buildSimpleTableQuery(queryString, table), whereColumn);
    query(queryString, table, [whereValue], callback);
}

function addOneWhereClause(queryString, column) {
    return queryString + " WHERE " + column + "=?";
}

function buildParameterizedQuery(table, columns, values, type, callback) {
    if (columns instanceof Array && values instanceof Array && columns.length === values.length) {
        switch (type) {
            case "update":
                return buildUpdateQuery(table, columns);
            case "insert":
                return buildInsertQuery(table, columns);
            default:
                callback("Parameterized query failure: " + type + " is not a parameterized query");
        }
    } else {
        callback("Parameterized query failed: poorly formed columns and values")
    }
}

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