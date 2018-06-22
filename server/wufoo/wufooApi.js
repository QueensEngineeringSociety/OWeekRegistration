var request = require("request");
var PropertiesReader = require('properties-reader');
var con = require("./wufooConstants.js");
var query = require("./wufooQueryBuilder.js");

var properties = PropertiesReader(__dirname + "/../../config/wufoo_properties.ini");

var fields = con.allFields;
var group = con.grouping;

exports.queries = {
    all: query.buildQuery(),
    foodRestrictions: query.buildQuery([query.buildNotNull(fields.foodRestrictions), query.buildNotEqual(fields.foodRestrictions, "none")], group.and),
    medicalConcerns: query.buildQuery([query.buildNotNull(fields.medicalConcerns), query.buildNotEqual(fields.medicalConcerns, "none")], group.and),
    accessibilityConcerns: query.buildQuery([query.buildNotNull(fields.accessibilityConcerns), query.buildNotEqual(fields.accessibilityConcerns, "none")], group.and),
    wantPrimer: query.buildQuery([query.buildEquals(fields.primer, "yes")]),
    payOnline: query.buildQuery([query.buildEquals(fields.payOnline, "yes")]),
    payInPerson: query.buildQuery([query.buildEquals(fields.payPerson, "yes")]),
    payByMail: query.buildQuery([query.buildEquals(fields.payMail, "yes")]),
    age: query.buildQuery([query.buildEquals(fields.under18, "yes")])
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