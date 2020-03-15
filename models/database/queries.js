const mysql = require('mysql');
const PropertiesReader = require('properties-reader');
const constants = require("./dbConstants");

//TODO finish building pre-made queries, put queries into model

const queries = constants.queries;
const properties = PropertiesReader(__dirname + "/../../config/db_properties.cfg");

let connection = mysql.createConnection({
    host: properties.get('host'),
    user: properties.get('user'),
    password: properties.get('password'),
    database: properties.get('database')
});

exports.connect = function () {
    connection.connect(function (err) {
        if (err) throw err;
    });
};

//TODO remove
exports.query = async function (queryString, params) {
    return await innerQuery(queryString, params);
};

function innerQuery(queryString, params) {
    return new Promise(function (resolve, reject) {
        connection.query(queryString, params, function (err, rows) {
            if (err) {
                console.log(err); //TODO log
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
}

exports.selectAll = async function (table) {
    return await innerQuery(buildSimpleTableQuery(queries.SELECT_ALL, table), table, []);
};

exports.selectAllUsers = async function () {
    return await innerQuery(buildSimpleTableQuery("SELECT first_name, last_name, username, isAdmin FROM", "users"), "users", []);
};

exports.selectWhereClause = async function (table, whereColumn, whereValue) {
    return await simpleTableWhereQuery(table, whereColumn, whereValue, queries.SELECT_ALL);
};

exports.deleteWhereClause = async function (table, whereColumn, whereValue) {
    return await simpleTableWhereQuery(table, whereColumn, whereValue, queries.DELETE_ALL);
};

exports.insert = async function (table, columns, values) {
    return await innerQuery(buildParameterizedQuery(table, columns, values, "insert"), values);
};

exports.updateAllColumns = async function (table, columns, values) {
    return await innerQuery(buildParameterizedQuery(table, columns, values, "update"), values);
};

exports.updateWhereClause = async function (table, columns, values, whereColumn, whereValue) {
    return await parameterizedWhereQuery(table, columns, values, whereColumn, whereValue, "update");
};

async function parameterizedWhereQuery(table, columns, values, whereColumn, whereValue, type) {
    let queryString = addOneWhereClause(buildParameterizedQuery(table, columns, values, type), whereColumn);
    values.push(whereValue);
    return await innerQuery(queryString, values);
}

async function simpleTableWhereQuery(table, whereColumn, whereValue, queryString) {
    queryString = addOneWhereClause(buildSimpleTableQuery(queryString, table), whereColumn);
    return await innerQuery(queryString, [whereValue]);
}

function addOneWhereClause(queryString, column) {
    return queryString + " WHERE " + column + "=?";
}

function buildParameterizedQuery(table, columns, values, type) {
    if (columns instanceof Array && values instanceof Array && columns.length === values.length) {
        switch (type) {
            case "update":
                return buildUpdateQuery(table, columns);
            case "insert":
                return buildInsertQuery(table, columns);
            default:
                throw new Error("Parameterized query failure: " + type + " is not a parameterized query");
        }
    } else {
        throw new Error("Parameterized query failed: poorly formed columns and values")
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