const dbConn = require("../models/database/queries.js");
const con = require("../models/wufoo/wufooConstants");
const wufoo = require("../models/wufoo/wufooApi.js");
const constants = require("../server/util");
const view = require("./rendering");
const util = require("../server/util");

const routes = constants.routes;
const views = constants.views;
const query = wufoo.queries;

let maxNumOfGroups = 30;

exports.get = {
    all: getAll,
};

exports.post = {
    specificOne: postSpecificOne,
    maxNumGroups: postMaxNumOfGroups,
    assign: postAssign,
    clear: postClear,
    numberChange: postNumberChange
};

function getAll(request, result) {
    dbConn.query("SELECT maxNumOfGroups FROM groupMetaData", function (err, rows) {
        if (err) {
            view.renderError(result, "Cannot get number of groups.");
        } else {
            maxNumOfGroups = rows[0].maxNumOfGroups;
            dbConn.selectAll("groups", function (err, rows) {
                if (err) {
                    view.renderError(result, "No groups");
                } else {
                    result.render(views.GROUPS, {
                        groups: rows,
                        groupMax: maxNumOfGroups
                    });
                }
            });
        }
    });
}

function postSpecificOne(request, result) {
    dbConn.selectWhereClause("groupData", "groupNum", request.body.groupNumber, function (err, groupDataRows) {
        if (!groupDataRows.length) {
            view.renderError(result, "No groups");
        } else {
            let entryIds = [];
            for (let i = 0; i < groupDataRows.length; i++) {
                entryIds[i] = groupDataRows[i].wufooEntryId;
            }
            wufoo.getEntriesById(entryIds, function (body) {
                body = JSON.parse(body);
                dbConn.selectWhereClause("groups", "groupNumber", request.body.groupNumber, function (err, rows) {
                    if (!rows.length) {
                        view.renderError(result, `Group ${request.body.groupNumber} doesn't exist`);
                    } else {
                        let groupNumbers = util.getGroupNumbers(groupDataRows);
                        result.render(views.GROUP, {
                            isAdmin: true,
                            groupData: rows[0], //only one group with that group number
                            peopleInGroup: body,
                            fields: con.groupFields,
                            headings: con.headings,
                            groupNumbers: groupNumbers
                        });
                    }
                });
            });
        }
    });
}

function postMaxNumOfGroups(request, result) {
    if (request.body.updatemax) {
        dbConn.updateAllColumns("groupMetaData", ["maxNumOfGroups"], [request.body.updatemax], function (err) {
            if (err) {
                result.render(views.ERROR, {errorMessage: "Couldn't updateAllColumns maximum group number."});
            } else {
                result.redirect(routes.ALL_GROUPS);
            }
        });
    } else {
        view.renderError(result, "Not given a maximum group number.");
    }
}

function postAssign(request, result) {
    dbConn.selectAll("groupMetaData", function (err, rows) {
            if (!rows.length) {
                view.renderError(result, "No metadata could be used to assign groups.");
            } else {
                let manGroupNum = rows[0].manGroupNum;
                let womanGroupNum = rows[0].womanGroupNum;
                //get frosh already in a group
                dbConn.selectAll("groupData", function (err, rows) {
                    let assignedFrosh = [];
                    if (rows.length) {
                        for (let i in rows) {
                            assignedFrosh.push(rows[i].wufooEntryId);
                        }
                    }
                    wufoo.makeQuery(0, query.all, [], function (body) {
                        //show updated groups
                        body = util.pruneDuplicateFrosh(JSON.parse(body));
                        let insertions = [];
                        for (let i in body) {
                            if (!inArr(assignedFrosh, body[i].EntryId)) {
                                insertions.push({
                                    "id": body[i].EntryId,
                                    "genderIsMan": isMan((body[i])[con.allFields.pronouns])
                                });
                            }
                        }
                        if (insertions.length) {
                            assign(manGroupNum, womanGroupNum, insertions).then(function () {
                                result.redirect("back"); //refresh
                            }).catch(function (errMessage) {
                                view.renderError(result, errMessage);
                            });
                        } else {
                            result.redirect("back");
                        }
                    });
                });
            }
        }
    );
}

function isMan(text) {
    //if doesn't use she or her as pronoun, assume man
    text = text.toLowerCase();
    return text.indexOf("she") === -1 && text.indexOf("her") === -1;
}

function assign(manGroupNum, womanGroupNum, froshToInsert) {
    return new Promise(function (resolve, reject) {
        //determine which frosh goes into which group
        let insertions = [];
        let newGroupData = []; //index will be group number, holds object with the man/woman count
        for (let i = 0; i < froshToInsert.length; i++) {
            let newData = {
                "menCount": 0,
                "womenCount": 0,
                "totalCount": 0
            };
            if (froshToInsert[i].genderIsMan) {
                insertions.push({"groupNum": manGroupNum, "wufooEntryId": froshToInsert[i].id});
                if (newGroupData[manGroupNum]) {
                    newData.menCount = newGroupData[manGroupNum].menCount + 1;
                    newData.womenCount = newGroupData[manGroupNum].womenCount;
                    newData.totalCount = newGroupData[manGroupNum].totalCount + 1;
                    newGroupData[manGroupNum] = newData;
                } else {
                    newData.menCount = 1;
                    newData.totalCount = 1;
                    newGroupData[manGroupNum] = newData;
                }
                manGroupNum = incGroupNum(manGroupNum);
            } else {
                insertions.push({"groupNum": womanGroupNum, "wufooEntryId": froshToInsert[i].id});
                if (newGroupData[womanGroupNum]) {
                    newData.menCount = newGroupData[womanGroupNum].menCount;
                    newData.womenCount = newGroupData[womanGroupNum].womenCount + 1;
                    newData.totalCount = newGroupData[womanGroupNum].totalCount + 1;
                    newGroupData[womanGroupNum] = newData;
                } else {
                    newData.womenCount = 1;
                    newData.totalCount = 1;
                    newGroupData[womanGroupNum] = newData;
                }
                womanGroupNum = incGroupNum(womanGroupNum);
            }
        }
        //updateAllColumns running counter for man and woman group numbers
        dbConn.updateAllColumns("groupMetaData", ["manGroupNum", "womanGroupNum"],
            [manGroupNum, womanGroupNum], function (err) {
                if (err) {
                    reject("Couldn't updateAllColumns groups.");
                } else {
                    //get the old group data, then add on new group data and updateAllColumns
                    dbConn.selectAll("groups", function (err, rows) {
                        if (err) {
                            reject("Couldn't updateAllColumns group data, metadata was updated so contact DoIT.")
                        } else {
                            if (rows.length) {
                                //previous groups, combine new with old data
                                for (let i = 0; i < rows.length; i++) {
                                    let newData = newGroupData[rows[i].groupNumber];
                                    if (newData) {
                                        newData.totalCount += rows[i].totalCount;
                                        newData.womenCount += rows[i].womenCount;
                                        newData.menCount += rows[i].menCount;
                                    }
                                    newGroupData[rows[i].groupNumber] = newData;
                                }
                            }
                            insertNewGroupData(0, newGroupData).then(function () {
                                //updateAllColumns individual frosh
                                insertFroshToGroup(0, insertions).then(function () {
                                    resolve();
                                }).catch(function (m) {
                                    reject(m);
                                });
                            }).catch(function (m) {
                                reject(m);
                            });
                        }
                    });
                }
            });
    });
}

function incGroupNum(num) {
    return (num + 1) % maxNumOfGroups;
}

function insertFroshToGroup(insertIdx, insertions) {
    return new Promise(function (res, rej) {
        if (insertIdx < insertions.length) {
            let id = insertions[insertIdx].wufooEntryId;
            let num = insertions[insertIdx].groupNum;
            dbConn.insert("groupData", ["wufooEntryId", "groupNum"], [id, num], function (err) {
                if (err) {
                    rej("Couldn't updateAllColumns individual frosh, contact DoIT as metadata and group data were updated.");
                } else {
                    insertFroshToGroup(insertIdx + 1, insertions).then(function () {
                        res();
                    });
                }
            });
        } else {
            res();
        }
    });
}

function insertNewGroupData(insertIdx, newGroupData) {
    return new Promise(function (res, rej) {
            if (insertIdx < newGroupData.length) {
                let data = newGroupData[insertIdx];
                if (data) {
                    dbConn.query("INSERT groups VALUES(?,?,?,?) ON DUPLICATE KEY UPDATE menCount=VALUES(menCount),womenCount=VALUES(womenCount),totalCount=VALUES(totalCount)",
                        [insertIdx, data.menCount, data.womenCount, data.totalCount], function (err) {
                            if (err) {
                                rej("Couldn't updateAllColumns groups properly. Metadata was updated, contact DoIT to postEdit the database.")
                            } else {
                                insertNewGroupData(insertIdx + 1, newGroupData).then(function () {
                                    res();
                                });
                            }
                        });
                } else {
                    insertNewGroupData(insertIdx + 1, newGroupData).then(function () {
                        res();
                    });
                }
            } else {
                res();
            }
        }
    );
}

function inArr(assignedFrosh, compareId) {
    for (let i in assignedFrosh) {
        if (assignedFrosh[i] == compareId) { //diff types
            return true;
        }
    }
    return false;
}

function postClear(request, result) {
    dbConn.updateAllColumns("groupMetaData", ["manGroupNum", "womanGroupNum"], [0, 0], function (err) {
        if (err) {
            view.renderError(result, "Could not getDelete any group data");
        } else {
            dbConn.query("DELETE FROM groupData", function (err) {
                if (err) {
                    view.renderError(result, "Cleared metadata and groups, but couldn't getDelete group data. Contact DoIT.");
                } else {
                    dbConn.query("DELETE FROM groups", function (err) {
                        if (err) {
                            view.renderError(result, "Cleared metadata, but couldn't getDelete groups. Contact DoIT.");
                        } else {
                            result.redirect(routes.ALL_GROUPS);
                        }
                    });
                }
            });
        }
    });
}

function postNumberChange(request, result) {
    let newDbGroupNumber = request.body.new_group_number - 1;
    let oldDbGroupNumber = request.body.old_group_number - 1;
    let man = isMan(request.body.pronouns);
    dbConn.updateWhereClause("groupData", ["groupNum"], [newDbGroupNumber], "wufooEntryId", request.body.wufooEntryId, function () {
        setNewCount(oldDbGroupNumber, true, man, function () {
            setNewCount(newDbGroupNumber, false, man, function () {
                result.redirect(util.routes.FILTER);
            });
        });
    });
}

function setNewCount(groupNumber, isOldGroup, isMan, callback) {
    dbConn.selectWhereClause("groups", "groupNumber", groupNumber, function (err, rows) {
        let group = rows[0];
        let newManCount = group.menCount;
        let newWomanCount = group.womenCount;
        let change = 1;
        if (isOldGroup) {
            change = -1;
        }
        if (isMan) {
            newManCount += change;
        } else {
            newWomanCount += change;
        }
        dbConn.updateWhereClause("groups", ["menCount", "womenCount", "totalCount"],
            [newManCount, newWomanCount, newManCount + newWomanCount], "groupNumber", groupNumber, callback);
    });
}