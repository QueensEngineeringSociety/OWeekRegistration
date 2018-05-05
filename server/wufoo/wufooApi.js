var request = require("request");
var PropertiesReader = require('properties-reader');
var con = require("./wufooConstants.js");
var query = require("./wufooQueryBuilder.js");

var properties = PropertiesReader(__dirname + "/../../config/wufoo_properties.ini");

var fields = con.fields;
var group = con.grouping;

exports.queries = {
    all: query.buildQuery(),
    allergy: query.buildQuery([query.buildNotNull(fields.allergies), query.buildNotEqual(fields.allergies, "none")], group.and)
};

exports.makeQuery = function (queryString, callback) {
    request({
        uri: properties.get('uri') + queryString,
        method: properties.get('method'),
        auth: {
            'username': properties.get('username'),
            'password': properties.get('password'),
            'sendImmediately': false
        }
    }, function (error, response, body) {
        callback(body);
    });
};