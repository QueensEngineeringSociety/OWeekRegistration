var con = require("./wufooConstants");

//takes array of built partial queries and combines them
exports.buildQuery = function (partialQueries, grouping) {
    var queryString = "?";
    var length = partialQueries.length;
    for (var i = 0; i < length; i++) {
        console.log("PARTIAL: " + partialQueries[i]);
        if (i > 0) {
            //add & if on second or further filter
            queryString += "&";
        }
        queryString += "Filter" + (i + 1) + '=' + partialQueries[i];
    }
    if (inObject(con.grouping, grouping))
        queryString += grouping;
    console.log("QUERY: " + queryString);
    return queryString;
};

//takes one partial query and adds FilterID to it - no grouping because only 1 filter
exports.buildOneQuery = function (partialQuery) {
    return "?Filter1=" + partialQuery;
};

//helper for all partial builder queries - sets format and checks field and operator correctness
function buildPartialQuery(field, value, operator) {
    if (inObject(field, con.fields) && inObject(operator, con.operators)) {
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

//ensure a field said to be in an object is actually in the object
function inObject(obj, field) {
    for (var eachField in obj) {
        if (eachField === field)
            return true;
    }
    return false;
}