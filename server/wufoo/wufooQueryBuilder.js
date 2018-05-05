var con = require("./wufooConstants");

//takes array of built partial queries and combines them
//grouping is optional - if undefined it is ignored.
exports.buildQuery = function (partialQueries, grouping) {
    if (typeof partialQueries === "undefined") {
        return ""; //no data passed in, so just take all entries
    }
    var queryString = "?";
    var length = partialQueries.length;
    for (var i = 0; i < length; i++) {
        if (i > 0) {
            //add & if on second or further filter
            queryString += "&";
        }
        queryString += "Filter" + (i + 1) + '=' + partialQueries[i];
    }
    if (typeof grouping !== "undefined" && inObject(con.grouping, grouping))
        queryString += grouping;
    return queryString;
};

//helper for all partial builder queries - sets format and checks field and operator correctness
function buildPartialQuery(field, value, operator) {
    if (inObject(con.fields, field) && inObject(con.operators, operator)) {
        return field + '+' + operator + '+' + value;
    }
    return "";
}

//partial query builder functions - specifies one filter's field, value and operator

exports.buildContains = function (field, value) {
    return buildPartialQuery(field, value, con.operators.contains);
};

exports.buildNotContains = function (field, value) {
    return buildPartialQuery(field, value, con.operators.notContain);
};

exports.buildStarts = function (field, value) {
    return buildPartialQuery(field, value, con.operators.startWith);
};

exports.buildEnds = function (field, value) {
    return buildPartialQuery(field, value, con.operators.endWith);
};

exports.buildLess = function (field, value) {
    return buildPartialQuery(field, value, con.operators.lessThan);
};

exports.buildGreater = function (field, value) {
    return buildPartialQuery(field, value, con.operators.greaterThan);
};

exports.buildOn = function (field, value) {
    return buildPartialQuery(field, value, con.operators.on);
};

exports.buildBefore = function (field, value) {
    return buildPartialQuery(field, value, con.operators.before);
};

exports.buildAfter = function (field, value) {
    return buildPartialQuery(field, value, con.operators.after);
};

exports.buildNotEqual = function (field, value) {
    return buildPartialQuery(field, value, con.operators.notEqual);
};

exports.buildEquals = function (field, value) {
    return buildPartialQuery(field, value, con.operators.equal);
};

//special case, no value, so don't use buildPartialQuery helper
exports.buildNotNull = function (field) {
    if (inObject(con.fields, field)) {
        return field + '+' + con.operators.notNull;
    }
    return "";
};

//ensure a value said to be in an object is actually in the object
function inObject(obj, value) {
    for (var eachKey in obj) {
        if (obj.hasOwnProperty(eachKey) && obj[eachKey] === value)
            return true;
    }
    return false;
}