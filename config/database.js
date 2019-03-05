const mysql = require('mysql');
const PropertiesReader = require('properties-reader');

const properties = PropertiesReader(__dirname+"/db_properties.ini");

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

//TODO make multiple query functions - e.g. insert, getDelete, update etc. - e.g. insert has NOW() automatically for created
exports.query = function (queryString, params, callback) {
    //TODO check queryString for correctness
    con.query(queryString, params, function (err, rows) {
        callback(err, rows);
    });
};