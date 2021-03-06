const logger = require("../server/logger")(__filename);
exports.db = require("./database");
exports.wufoo = require("./wufoo/wufooApi");
const RenderObject = require("../models/renderObject");
const wufooCon = require("./wufoo/wufooConstants");
exports.con = wufooCon;
const constants = require("../server/util");
exports.routes = constants.routes;
exports.views = constants.views;

exports.execute = async function (errMessage, isView, target, executorFunction) {
    try {
        let result = await executorFunction();
        if (!result) {
            result = {}
        }
        let renderObject = new RenderObject(result.groupNumbers);
        renderObject.setNav(result.nextPage, result.prevPage, result.actionPath);
        renderObject.setTarget(target, isView);
        renderObject.setInfo(result.data);
        return renderObject;
    } catch (e) {
        if (e.stack) {
            logger.error(`${errMessage} : ${e.stack}`);
        } else {
            logger.error(`${errMessage} : ${e}`);
        }
        return {error: errMessage};
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