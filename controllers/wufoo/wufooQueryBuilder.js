const con = require("./wufooConstants");

const yesValue = "yes";
const paidValue = "paid";
exports.PAGE_SIZE = 100;
const defaultQueryEnd = "sort=EntryId&sortDirection=DESC&system=true"; //for paymentMethod status and newest entries first. No renderData passed in, so just take all entries

exports.all = function (pageStart) {
    return general(pageStart);
};
exports.foodRestrictions = function (pageStart) {
    return issue(pageStart, con.allFields.foodRestrictions);
};
exports.medicalConcerns = function (pageStart) {
    return issue(pageStart, con.allFields.medicalConcerns);
};
exports.accessibilityConcerns = function (pageStart) {
    return issue(pageStart, con.allFields.accessibilityConcerns);
};
exports.wantPrimer = function (pageStart) {
    return general(pageStart, equals(con.allFields.primer, yesValue));
};
exports.payOnline = function (pageStart) {
    return general(pageStart, equals(con.allFields.payOnline, yesValue));
};
exports.payInPerson = function (pageStart) {
    return general(pageStart, equals(con.allFields.payPerson, yesValue));
};
exports.payByMail = function (pageStart) {
    return general(pageStart, equals(con.allFields.payMail, yesValue));
};
exports.age = function (pageStart) {
    return general(pageStart, equals(con.allFields.under18, yesValue));
};
exports.unpaid = function (pageStart) {
    return general(pageStart, notEquals(con.allFields.payStatus, paidValue));
};

exports.pronoun = function (pageStart) {
    return pronouns(pageStart);
};

exports.netid = function (pageStart, netid) {
    return general(pageStart) + "&Filter1=" + con.allFields.netid + '+' + con.operators.equals + '+' + netid;
};

exports.entryID = function (pageStart, ids) {
    let partialQueries = [];
    for (let i = 0; i < ids.length; i++) {
        partialQueries[i] = equals("EntryId", ids[i]);
    }
    return general(pageStart, partialQueries, con.grouping.or);
};

exports.search = function (field, operator, value) {
    return custom(field, operator, value);
};

//takes array of built partial queries and combines them
//grouping is optional - if undefined it is ignored.
function general(pageStart, partialQueries, grouping) {
    let queryString = "?";
    if (!partialQueries) {
        return queryString + defaultQueryEnd;
    }
    if (!Array.isArray(partialQueries)) {
        partialQueries = [partialQueries];
    }
    let length = partialQueries.length;
    for (let i = 0; i < length; i++) {
        if (i > 0) {
            //add & if on second or further filter
            queryString += "&";
        }
        queryString += "Filter" + (i + 1) + '=' + partialQueries[i];
    }
    if (grouping && inObject(con.grouping, grouping)) {
        queryString += grouping;
    }
    return queryString + "&" + defaultQueryEnd;
}

function issue(pageStart, field) {
    return general(pageStart, [notNull(field), notEquals(field, "none"),
        notEquals(field, "n/a"), notEquals(field, "no"), notEquals(field, "na")], con.grouping.and);
}

//for the form where user chooses the query
//the form has the key names as those are the english ones
//this checks for that key actually being in the containing object, then puts the value in the query
function custom(field, operator, value) {
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
    return general(0, [buildPartialQuery(f, value, op)]);
}

exports.makePaginated = function (pageStart) {
    return `&pageSize=${exports.PAGE_SIZE}&pageStart=${pageStart}`;
};

//helper for all partial builder queries - sets format and checks field and operator correctness
function buildPartialQuery(field, value, operator) {
    if (/*inObject(con.allFields, field) && */inObject(con.operators, operator)) {
        return field + '+' + operator + '+' + value;
    }
    return "";
}

//partial query builder functions - specifies one filter's field, value and operator

function contains(field, value) {
    return buildPartialQuery(field, value, con.operators.contains);
}

function notContains(field, value) {
    return buildPartialQuery(field, value, con.operators.notContain);
}

function starts(field, value) {
    return buildPartialQuery(field, value, con.operators.startWith);
}

function ends(field, value) {
    return buildPartialQuery(field, value, con.operators.endWith);
}

function less(field, value) {
    return buildPartialQuery(field, value, con.operators.lessThan);
}

function greater(field, value) {
    return buildPartialQuery(field, value, con.operators.greaterThan);
}

function on(field, value) {
    return buildPartialQuery(field, value, con.operators.on);
}

function before(field, value) {
    return buildPartialQuery(field, value, con.operators.before);
}

function after(field, value) {
    return buildPartialQuery(field, value, con.operators.after);
}

function notEquals(field, value) {
    return buildPartialQuery(field, value, con.operators.notEqual);
}

function equals(field, value) {
    return buildPartialQuery(field, value, con.operators.equals);
}

//special case, no value, so don't use buildPartialQuery helper
function notNull(field) {
    if (inObject(con.allFields, field)) {
        return field + '+' + con.operators.notNull;
    }
    return "";
}

//ensure a value said to be in an object is actually in the object
function inObject(obj, value) {
    for (let eachKey in obj) {
        if (obj.hasOwnProperty(eachKey) && obj[eachKey] === value)
            return true;
    }
    return false;
}

function pronouns(pageStart) {
    return general(pageStart) + "&Filter1=" + con.allFields.pronouns + '+' + con.operators.notEqual + '+' + "She/Her&Filter2=" +
        con.allFields.pronouns + '+' + con.operators.notEqual + '+' + "He/Him&Filter3=" + con.allFields.pronouns + '+'
        + con.operators.notEqual + '+' + "She&Filter4=" + con.allFields.pronouns + '+' + con.operators.notEqual
        + '+' + "He&Filter5=" + con.allFields.pronouns + '+' + con.operators.notNull + "&match=" + con.grouping.and;
}