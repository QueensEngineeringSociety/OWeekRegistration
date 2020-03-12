const wufooCon = require("../models/wufoo/wufooConstants");

exports.routes = {
    HOME: "/",
    LOGIN: "/login",
    USER_MANAGEMENT: "/usermanagement",
    SIGN_UP: "/signup",
    USER_EDIT: "/useredit",
    USER_DELETE: "/userdelete",
    FILTER: "/filter",
    AGE: "/age",
    FOOD_RESTRICTIONS: "/food_restrictions",
    PRIMER: "/primer",
    MEDICAL: "/medical",
    PRONOUNS: "/pronouns",
    ACCESSIBILITY: "/accessibility",
    PAY_PERSON: "/payPerson",
    PAY_ONLINE: "/payOnline",
    PAY_MAIL: "/payMail",
    UNPAID: "/unpaid",
    SEARCH: "/search",
    NET_ID: "/netid",
    ALL_GROUPS: "/allgroups",
    ONE_GROUP: "/onegroup",
    UPDATE_MAXNUM_GROUPS: "/updatemaxnum",
    ASSIGN: "/assign",
    CLEAR_GROUPS: "/cleargroups",
    ERROR: "/error",
    LOGOUT: "/logout",
    EXPORT: "/export",
    PRUNE: "/prune_frosh"
};

exports.views = {
    INDEX: "index.ejs",
    DELETE_USERS: "deleteusers.ejs",
    ERROR: "error.ejs",
    FILTER: "filter.ejs",
    GROUP: "group.ejs",
    GROUPS: "groups.ejs",
    LOGIN: "login.ejs",
    SEARCH: "search.ejs",
    USERS: "users.ejs"
};

exports.isAdmin = function (req) {
    return req.user.isAdmin;
};

exports.valInObj = function (val, obj) {
    return Object.values(obj).indexOf(val) > -1;
};

exports.getGroupNumbers = function (rows) {
    let groupNumbers = [];
    for (let i in rows) {
        groupNumbers[rows[i].wufooEntryId] = rows[i].groupNum; //i ID is unique
    }
    return groupNumbers;
};

exports.pruneDuplicateFrosh = function (entries) {
    let savedEntries = {};
    let netidKey = wufooCon.allFields.netid;
    for (let entry of entries) {
        if (savedEntries[entry[netidKey]]) {
            let savedEntry = savedEntries[entry[netidKey]];
            if (keepSavedEntry(savedEntry, entry)) {
            } else {
                savedEntries[savedEntry[netidKey]] = entry;
            }
        } else {
            savedEntries[entry[netidKey]] = entry;
        }
    }
    return Object.values(savedEntries);
};

function keepSavedEntry(savedEntry, curEntry) {
    let paidKey = wufooCon.allFields.payStatus;
    if (savedEntry[paidKey] !== curEntry[paidKey]) {
        if (savedEntry[paidKey] && savedEntry[paidKey].toLowerCase() === "paid") {
            return savedEntry;
        } else if (curEntry[paidKey]) {
            return curEntry;
        }
    }
    let savedCreatedDate = new Date(savedEntry["DateCreated"]);
    let curCreatedDate = new Date(curEntry["DateCreated"]);
    return savedCreatedDate >= curCreatedDate;
}