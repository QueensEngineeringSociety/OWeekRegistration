const util = require("../controllerUtil");
const db = util.db;
const view = util.view;
const wufoo = util.wufoo;
const con = util.con;
const model = require("../../models");

exports.one = async function (newGroupNumber, oldGroupNumber, pronouns, wufooEntryId) {
    return await util.execute("set", "one group", false, util.routes.FILTER, async function () {
        let newDbGroupNumber = newGroupNumber - 1;
        let oldDbGroupNumber = oldGroupNumber - 1;
        let man = isMan(pronouns);
        let groupData = new model.GroupData(wufooEntryId, newDbGroupNumber);
        await db.set.group(groupData);
        await setNewCount(oldDbGroupNumber, true, man);
        await setNewCount(newDbGroupNumber, false, man);
    });
};

exports.number = async function (newMaxNumber) {
    return await util.execute("set", "number of groups", false, util.routes.ALL_GROUPS, async function () {
        await db.set.maxNumberOfGroups(newMaxNumber);
    });
};

exports.all = async function () {
    return await util.execute("set", "all groups", false, util.routes.ALL_GROUPS, async function () {
        let gropMetaData = await db.get.groupMetaData();
        let manGroupNum = gropMetaData.manGroupNum;
        let womanGroupNum = gropMetaData.womanGroupNum;
        //get frosh already in a group
        let rows = await db.get.allGroupData();
        let assignedFrosh = [];
        if (rows.length) {
            for (let i in rows) {
                assignedFrosh.push(rows[i].wufooEntryId);
            }
        }
        let body = await wufoo.makeQuery(0, util.query.all, []);
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
            await assign(manGroupNum, womanGroupNum, insertions);
        }
    });
};

function isMan(pronouns) {
    //if doesn't use she or her as pronoun, assume man
    pronouns = pronouns.toLowerCase();
    return pronouns.indexOf("she") === -1 && pronouns.indexOf("her") === -1;
}

async function assign(manGroupNum, womanGroupNum, froshToInsert) {
    //determine which frosh goes into which group
    let insertions = [];
    let newGroupData = []; //index will be group number, holds object with the man/woman count

    let groupMetaDataRows = await db.query("SELECT maxNumOfGroups FROM groupMetaData");
    let maxNumOfGroups = groupMetaDataRows[0].maxNumOfGroups;
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
    await db.set.groupNumberCounters(manGroupNum, womanGroupNum);
    //get the old group renderData, then add on new group renderData and updateAllColumns
    let rows = await db.get.allGroups();
    if (rows.length) {
        //previous groups, combine new with old renderData
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
    await insertNewGroupData(0, newGroupData);
    //updateAllColumns individual frosh
    await insertFroshToGroup(0, insertions);
}

function incGroupNum(num, maxNumOfGroups) {
    return (num + 1) % maxNumOfGroups;
}

async function insertFroshToGroup(insertIdx, insertions) {
    if (insertIdx < insertions.length) {
        let groupData = new model.GroupData(insertions[insertIdx].wufooEntryId, insertions[insertIdx].groupNum);
        await db.set.group(groupData);
        await insertFroshToGroup(insertIdx + 1, insertions);
    }
}

async function insertNewGroupData(insertIdx, newGroupData) {
    if (insertIdx < newGroupData.length) {
        let data = newGroupData[insertIdx];
        if (data) {
            await db.query("INSERT groups VALUES(?,?,?,?) ON DUPLICATE KEY UPDATE menCount=VALUES(menCount),womenCount=VALUES(womenCount),totalCount=VALUES(totalCount)",
                [insertIdx, data.menCount, data.womenCount, data.totalCount]);
            await insertNewGroupData(insertIdx + 1, newGroupData);
        } else {
            await insertNewGroupData(insertIdx + 1, newGroupData);
        }
    }
}

async function setNewCount(groupNumber, isOldGroup, isMan) {
    let rows = await db.get.group(groupNumber);
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
    let groupDataModel = new model.GroupData(groupNumber, newManCount, newWomanCount, newManCount + newWomanCount);
    await db.set.group(groupDataModel);
}