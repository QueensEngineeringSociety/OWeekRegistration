const con = require("./wufooConstants");

//takes array of built partial queries and combines them
//grouping is optional - if undefined it is ignored.
exports.buildQuery = function (partialQueries, grouping) {
    if (typeof partialQueries === "undefined") {
        return "?sort=EntryId&sortDirection=DESC&system=true"; //for paymentMethod status and newest entries first. No data passed in, so just take all entries
    }
    let queryString = "?";
    let length = partialQueries.length;
    for (let i = 0; i < length; i++) {
        if (i > 0) {
            //add & if on second or further filter
            queryString += "&";
        }
        queryString += "Filter" + (i + 1) + '=' + partialQueries[i];
    }
    if (typeof grouping !== "undefined" && inObject(con.grouping, grouping))
        queryString += grouping;
    queryString += "&sort=EntryId&sortDirection=DESC&system=true"; //for paymentMethod status and newest entries first
    return queryString;
};

exports.buildIssueQuery = function (field) {
    return exports.buildQuery([exports.buildNotNull(field), exports.buildNotEqual(field, "none"),
        exports.buildNotEqual(field, "n/a"), exports.buildNotEqual(field, "no"), exports.buildNotEqual(field, "na")], con.grouping.and);
};

//for the form where user chooses the query
//the form has the key names as those are the english ones
//this checks for that key actually being in the containing object, then puts the value in the query
exports.customQuery = function (field, operator, value) {
    let f, op;
    for (let fKey in con.allFields) {
        if (con.allFields.hasOwnProperty(fKey) && field === fKey) {
            f = con.allFields[fKey];
        }
    }
    for (let opKey in con.operators) {
        if (con.operators.hasOwnProperty(opKey) && operator === opKey) {
            op = con.operators[opKey];
        }
    }
    return exports.buildQuery([buildPartialQuery(f, value, op)]);
};

//helper for all partial builder queries - sets format and checks field and operator correctness
function buildPartialQuery(field, value, operator) {
    if (/*inObject(con.allFields, field) && */inObject(con.operators, operator)) {
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
    return buildPartialQuery(field, value, con.operators.equals);
};

//special case, no value, so don't use buildPartialQuery helper
exports.buildNotNull = function (field) {
    if (inObject(con.allFields, field)) {
        return field + '+' + con.operators.notNull;
    }
    return "";
};

//ensure a value said to be in an object is actually in the object
function inObject(obj, value) {
    for (let eachKey in obj) {
        if (obj.hasOwnProperty(eachKey) && obj[eachKey] === value)
            return true;
    }
    return false;
}

exports.buildPronouns = function () {
    return exports.buildQuery() + "&Filter1=" + con.allFields.pronouns + '+' + con.operators.notEqual + '+' + "She/Her&Filter2=" +
        con.allFields.pronouns + '+' + con.operators.notEqual + '+' + "He/Him&Filter3=" + con.allFields.pronouns + '+'
        + con.operators.notEqual + '+' + "She&Filter4=" + con.allFields.pronouns + '+' + con.operators.notEqual
        + '+' + "He&Filter5=" + con.allFields.pronouns + '+' + con.operators.notNull + "&match=" + con.grouping.and;
};

exports.buildNetidQuery = function (netid) {
    return exports.buildQuery() + "&Filter1=" + con.allFields.netid + '+' + con.operators.equals + '+' + netid;
};

exports.buildEntryIDsQuery = function (ids) {
    let partialQueries = [];
    for (let i = 0; i < ids.length; i++) {
        partialQueries[i] = exports.buildEquals("EntryId", ids[i]);
    }
    return exports.buildQuery(partialQueries, con.grouping.or)+"&pageSize=100"; //pageSize 100 will be large enough for any group ever
};