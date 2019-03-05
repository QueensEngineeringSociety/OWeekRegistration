const mysql = require('mysql');
const PropertiesReader = require('properties-reader');
const constants = require("./dbConstants");
const util = require("../../server/util");

const tables = constants.tables;
const queries = constants.queries;
const conditionals = constants.conditionals;
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
        callback(table + " is not a table in the database");
    }
};

function buildInsertQuery(table, columns) {
    let columnsString = queries.INSERT + " " + table + " (";
    let paramsString = "VALUES (";
    //columns and values same length due to if, so use one for loop to concat items
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
        callback(table + " is not a table in the database");
    }
}

function makeQuery(queryString, params, callback) {
    con.query(queryString, params, function (err, rows) {
        callback(err, rows);
    });
}