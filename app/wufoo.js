var request = require("request");
var PropertiesReader = require('properties-reader');
var properties = PropertiesReader(__dirname + "/../config/wufoo_properties.ini");

exports.queries = {
    allergy: "Filter1=Field6+Is_not_NULL&Filter2=Field6+Is_not_equal_to+none&match=AND"
};

exports.allEntries = function (callback) {
    request({
        uri: properties.get('uri'),
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

exports.filterEntries = function (queryString, callback) {
    request({
        uri: properties.get('uri') + "?" + queryString,
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