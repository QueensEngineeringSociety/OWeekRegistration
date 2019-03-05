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
    query(queries.SELECT_ALL, table, [], callback);
};

exports.deleteAll = function (table, callback) {
    query(queries.DELETE_ALL, table, [], callback);
};

function query(queryString, table, params, callback) {
    if (util.valInObj(table, tables)) {
        makeQuery(queryString + " " + table, params, callback);
    } else {
        callback(table + " is not a table in the database");
    }
}

function makeQuery(queryString, params, callback) {
    con.query(queryString, params, function (err, rows) {
        callback(err, rows);
    });
}