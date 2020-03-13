const util = require("../controllerUtil");
const db = util.db;
const view = util.view;
const wufoo = util.wufoo;
const con = util.con;

exports.one = function (request, result) {
    let newDbGroupNumber = request.body.new_group_number - 1;
    let oldDbGroupNumber = request.body.old_group_number - 1;
    let man = isMan(request.body.pronouns);
    db.updateWhereClause("groupData", ["groupNum"], [newDbGroupNumber], "wufooEntryId", request.body.wufooEntryId, function () {
        setNewCount(oldDbGroupNumber, true, man, function () {
            setNewCount(newDbGroupNumber, false, man, function () {
                result.redirect(util.routes.FILTER);
            });
        });
    });
};

exports.number = function (request, result) {
    if (request.body.updatemax) {
        db.updateAllColumns("groupMetaData", ["maxNumOfGroups"], [request.body.updatemax], function (err) {
            if (err) {
                result.render(util.views.ERROR, {errorMessage: "Couldn't updateAllColumns maximum group number."});
            } else {
                result.redirect(util.routes.ALL_GROUPS);
            }
        });
    } else {
        view.renderError(result, "Not given a maximum group number.");
    }
};

exports.all = function (request, result) {
    db.selectAll("groupMetaData", function (err, rows) {
            if (!rows.length) {
                view.renderError(result, "No metadata could be used to assign groups.");
            } else {
                let manGroupNum = rows[0].manGroupNum;
                let womanGroupNum = rows[0].womanGroupNum;
                //get frosh already in a group
                db.selectAll("groupData", function (err, rows) {
                    let assignedFrosh = [];
                    if (rows.length) {
                        for (let i in rows) {
                            assignedFrosh.push(rows[i].wufooEntryId);
                        }
                    }
                    wufoo.makeQuery(0, util.query.all, [], function (body) {
                        //show updated groups
                        body = util.pruneDuplicateFrosh(JSON.parse(body));
                        let insertions = [];
                        for (let i in body) {
                            if (!util.isInArr(assignedFrosh, body[i].EntryId)) {
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
};

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

        db.query("SELECT maxNumOfGroups FROM groupMetaData", function (err, rows) {
            let maxNumOfGroups = rows[0].maxNumOfGroups;
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
                    manGroupNum = incGroupNum(manGroupNum, maxNumOfGroups);
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
                    womanGroupNum = incGroupNum(womanGroupNum, maxNumOfGroups);
                }
            }
            //updateAllColumns running counter for man and woman group numbers
            db.updateAllColumns("groupMetaData", ["manGroupNum", "womanGroupNum"],
                [manGroupNum, womanGroupNum], function (err) {
                    if (err) {
                        console.log(err);
                        reject("Couldn't updateAllColumns groups.");
                    } else {
                        //get the old group data, then add on new group data and updateAllColumns
                        db.selectAll("groups", function (err, rows) {
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
    });

    function incGroupNum(num, maxNumOfGroups) {
        return (num + 1) % maxNumOfGroups;
    }
}

function insertFroshToGroup(insertIdx, insertions) {
    return new Promise(function (res, rej) {
        if (insertIdx < insertions.length) {
            let id = insertions[insertIdx].wufooEntryId;
            let num = insertions[insertIdx].groupNum;
            db.insert("groupData", ["wufooEntryId", "groupNum"], [id, num], function (err) {
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
                    db.query("INSERT groups VALUES(?,?,?,?) ON DUPLICATE KEY UPDATE menCount=VALUES(menCount),womenCount=VALUES(womenCount),totalCount=VALUES(totalCount)",
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

function setNewCount(groupNumber, isOldGroup, isMan, callback) {
    db.selectWhereClause("groups", "groupNumber", groupNumber, function (err, rows) {
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
        db.updateWhereClause("groups", ["menCount", "womenCount", "totalCount"],
            [newManCount, newWomanCount, newManCount + newWomanCount], "groupNumber", groupNumber, callback);
    });
}