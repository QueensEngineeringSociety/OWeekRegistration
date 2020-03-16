const mysql = require('mysql');
const PropertiesReader = require('properties-reader');
exports.table = require("./dbTables").tables;
const properties = PropertiesReader(__dirname + "/../../config/db_properties.cfg");
exports.build = require("./queryBuilder");

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

exports.query = function (queryString, params) {
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
};