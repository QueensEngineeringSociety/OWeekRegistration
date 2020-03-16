const logger = require("../server/logger")(__filename);
exports.db = require("../models/database");
exports.wufoo = require("../models/wufoo/wufooApi");
const wufooCon = require("../models/wufoo/wufooConstants");
exports.con = wufooCon;
const constants = require("../server/util");
exports.routes = constants.routes;
exports.views = constants.views;
exports.query = exports.wufoo.queries;

exports.execute = async function (action, identifier, isView, target, executorFunction) {
    try {
        let result = await executorFunction();
        if (!result) {
            result = {}
        }
        let renderObject = {};
        renderObject.target = target;
        renderObject.isView = isView;
        //TODO make model for render object?
        renderObject.nav = {
            nextPage: result.nextPage,
            prevPage: result.prevPage,
            actionPath: result.actionPath
        };
        renderObject.display = {
            operators: wufooCon.operators,
            headings: wufooCon.headings,
            allFields: wufooCon.allFields,
            generalFields: wufooCon.generalFields,
            groupNumbers: result.groupNumbers
        };
        renderObject.info = result.data;
        return renderObject;
    } catch (e) {
        //TODO improve error string shown to user
        if (e.stack) {
            logger.error(`${action} ${identifier} : ${e.stack}`);
        } else {
            logger.error(`${action} ${identifier} ; ${e}`);
        }
        return {error: `${action} ${identifier}`};
    }
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

exports.isInArr = function (array, comparison) {
    for (let f of array) {
        if (f == comparison) { //allow different types
            return true;
        }
    }
    return false;
};