const dbConn = require("../../config/database.js");
const con = require("../../server/wufoo/wufooConstants");
const wufoo = require("../../server/wufoo/wufooApi.js");
const query = wufoo.queries;

let maxNumInGroup = 30;

//TODO /onegroup via get after post directs to the get

exports.get = {
    all: getAll,
};

exports.post = {
    specificOne: postSpecificOne,
    maxGroupNum: postMaxGroupNum,
    assign: postAssign,
    clear: postClear
};

function getAll(request, result) {
    dbConn.query("SELECT maxNumInGroup FROM groupMetaData", function (err, rows) {
        if (err) {
            console.log("ERROR: " + err);
            result.render('error.ejs', {errorMessage: "Cannot get number of groups."});
        } else {
            maxNumInGroup = rows[0].maxNumInGroup;
            dbConn.query("SELECT * FROM groups", [], function (err, rows) {
                if (err) {
                    console.log("ERROR: " + err);
                    result.render('error.ejs', {errorMessage: "No groups"});
                } else {
                    result.render('groups.ejs', {
                        groups: rows,
                        groupMax: maxNumInGroup
                    });
                }
            });
        }
    });
}

function postSpecificOne(request, result) {
    dbConn.query("SELECT * FROM groupData WHERE groupNum = ?", [request.body.groupNumber], function (err, rows) {
        if (err) {
            console.log("ERROR: " + err);
        }
        if (!rows.length) {
            result.render('error.ejs', {errorMessage: "No groups"});
        } else {
            let entryIds = [];
            for (let i = 0; i < rows.length; i++) {
                entryIds[i] = rows[i].wufooEntryId;
            }
            wufoo.getEntriesById(entryIds, function (body) {
                body = JSON.parse(body);
                dbConn.query("SELECT * FROM groups WHERE groupNumber = ?", [request.body.groupNumber], function (err, rows) {
                    if (err) {
                        console.log("ERROR: " + err);
                    }
                    if (!rows.length) {
                        result.render('error.ejs', {errorMessage: "No groups"});
                    } else {
                        result.render('group.ejs', {
                            isAdmin: true,
                            groupData: rows[0], //only one group with that group number
                            peopleInGroup: body,
                            fields: con.groupFields,
                            headings: con.headings
                        });
                    }
                });
            });
        }
    });
}

function postMaxGroupNum(request, result) {
    if (request.body.updatemax) {
        dbConn.query("UPDATE groupMetaData SET maxNumInGroup=?", [request.body.updatemax], function (err) {
            if (err) {
                console.log("ERROR: " + err);
                result.render("error.ejs", {errorMessage: "Couldn't update maximum group number."});
            } else {
                result.redirect("/allgroups");
            }
        });
    } else {
        console.log("ERROR: No given maximum");
        result.render("error.ejs", {errorMessage: "Not given a maximum group number."});
    }
}

function postAssign(request, result) {
    dbConn.query("SELECT * FROM groupMetaData", function (err, rows) {
            if (err) {
                console.log("ERROR: " + err);
            }
            if (!rows.length) {
                result.render('error.ejs', {errorMessage: "No metadata could be used to assign groups."});
            } else {
                let manGroupNum = rows[0].manGroupNum;
                let womanGroupNum = rows[0].womanGroupNum;
                //get frosh already in a group
                dbConn.query("SELECT * FROM groupData", function (err, rows) {
                    let assignedFrosh = [];
                    if (err) {
                        console.log("ERROR: " + err);
                    }
                    if (rows.length) {
                        for (let i in rows) {
                            assignedFrosh.push(rows[i].wufooEntryId);
                        }
                    }
                    wufoo.makePaginatedQuery(0, query.all, function (body) {
                        //show updated groups
                        body = JSON.parse(body);
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
                                result.render('error.ejs', {errorMessage: errMessage});
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
        //update running counter for man and woman group numbers
        dbConn.query("UPDATE groupMetaData SET manGroupNum=?, womanGroupNum=?",
            [manGroupNum, womanGroupNum], function (err) {
                if (err) {
                    console.log("ERROR: " + err);
                    reject("Couldn't update groups.");
                } else {
                    //get the old group data, then add on new group data and update
                    dbConn.query("SELECT * FROM groups", function (err, rows) {
                        if (err) {
                            console.log("ERROR: " + err);
                            reject("Couldn't update group data, metadata was updated so contact DoIT.")
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
                                //update individual frosh
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
    return (num + 1) % maxNumInGroup;
}

function insertFroshToGroup(insertIdx, insertions) {
    return new Promise(function (res, rej) {
        if (insertIdx < insertions.length) {
            let id = insertions[insertIdx].wufooEntryId;
            let num = insertions[insertIdx].groupNum;
            dbConn.query("insert groupData values(?,?)", [id, num], function (err) {
                if (err) {
                    console.log("ERROR: " + err);
                    rej("Couldn't update individual frosh, contact DoIT as metadata and group data were updated.");
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
                                console.log("ERROR: " + err);
                                rej("Couldn't update groups properly. Metadata was updated, contact DoIT to postEdit the database.")
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
    dbConn.query("UPDATE groupMetaData set manGroupNum=0, womanGroupNum=0", function (err) {
        if (err) {
            console.log("ERROR: " + err);
            result.render('error.ejs', {errorMessage: "Could not getDelete any group data"});
        } else {
            dbConn.query("DELETE FROM groupData", function (err) {
                if (err) {
                    console.log("ERROR: " + err);
                    result.render('error.ejs', {errorMessage: "Cleared metadata and groups, but couldn't getDelete group data. Contact DoIT."});
                } else {
                    dbConn.query("DELETE FROM groups", function (err) {
                        if (err) {
                            console.log("ERROR: " + err);
                            result.render('error.ejs', {errorMessage: "Cleared metadata, but couldn't getDelete groups. Contact DoIT."});
                        } else {
                            result.redirect("/allgroups");
                        }
                    });
                }
            });
        }
    });
}