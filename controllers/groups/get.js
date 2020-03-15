const util = require("../controllerUtil");
const db = util.db;
const wufoo = util.wufoo;
const con = util.con;

exports.all = async function () {
    return await util.execute("get", "groups", true, util.views.GROUPS, async function () {
        let groupMetaDataRows = await db.query("SELECT maxNumOfGroups FROM groupMetaData");
        let maxNumOfGroups = groupMetaDataRows[0].maxNumOfGroups;
        let rows = await db.selectAll("groups");
        return {data: {groups: rows, groupMax: maxNumOfGroups}};
    });
};

exports.one = async function (groupNumber) {
    return await util.execute("get", "group", true, util.views.GROUP, async function () {
        let groupDataRows = await db.selectWhereClause("groupData", "groupNum", groupNumber);
        let entryIds = [];
        for (let i = 0; i < groupDataRows.length; i++) {
            entryIds[i] = groupDataRows[i].wufooEntryId;
        }
        let body = await wufoo.getEntriesById(entryIds);
        body = JSON.parse(body); //TODO wufoo should return parsed, ejs accepts parsed
        let rows = await db.selectWhereClause("groups", "groupNumber", groupNumber);
        let groupNumbers = util.getGroupNumbers(groupDataRows);
        return {fields: con.groupFields, groupNumbers: groupNumbers, data: {groupData: rows[0], peopleInGroup:body}};
    });
};