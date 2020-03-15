const util = require("../controllerUtil");
const db = util.db;
const view = util.view;
const wufoo = util.wufoo;
const con = util.con;

exports.one = async function (newGroupNumber, oldGroupNumber, pronouns, wufooEntryId) {
    return await util.execute("set", "one group", false, util.routes.FILTER, async function () {
        let newDbGroupNumber = newGroupNumber - 1;
        let oldDbGroupNumber = oldGroupNumber - 1;
        let man = isMan(pronouns);
        await db.updateWhereClause("groupData", ["groupNum"], [newDbGroupNumber], "wufooEntryId", wufooEntryId);
        await setNewCount(oldDbGroupNumber, true, man);
        await setNewCount(newDbGroupNumber, false, man);
    });
};

exports.number = async function (newMaxNumber) {
    return await util.execute("set", "number of groups", false, util.routes.ALL_GROUPS, async function () {
        await db.updateAllColumns("groupMetaData", ["maxNumOfGroups"], [newMaxNumber]);
    });
};

exports.all = async function () {
    return await util.execute("set", "all groups", false, util.routes.ALL_GROUPS, async function () {
        let groupMetaDataRows = await db.selectAll("groupMetaData");
        let manGroupNum = groupMetaDataRows[0].manGroupNum;
        let womanGroupNum = groupMetaDataRows[0].womanGroupNum;
        //get frosh already in a group
        let rows = await db.selectAll("groupData");
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
    await db.updateAllColumns("groupMetaData", ["manGroupNum", "womanGroupNum"],
        [manGroupNum, womanGroupNum]);
    //get the old group renderData, then add on new group renderData and updateAllColumns
    let rows = await db.selectAll("groups");
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
        let id = insertions[insertIdx].wufooEntryId;
        let num = insertions[insertIdx].groupNum;
        await db.insert("groupData", ["wufooEntryId", "groupNum"], [id, num]);
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
    let rows = await db.selectWhereClause("groups", "groupNumber", groupNumber);
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
    await db.updateWhereClause("groups", ["menCount", "womenCount", "totalCount"],
        [newManCount, newWomanCount, newManCount + newWomanCount], "groupNumber", groupNumber);
}