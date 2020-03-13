const util = require("../controllerUtil");
const db = util.db;
const wufoo = util.wufoo;
const con = util.con;

exports.all = async function (request, result) {
    let groupMetaDataRows = await db.query("SELECT maxNumOfGroups FROM groupMetaData");
    let maxNumOfGroups = groupMetaDataRows[0].maxNumOfGroups;
    let rows = await db.selectAll("groups");
    result.render(util.views.GROUPS, {
        groups: rows,
        groupMax: maxNumOfGroups
    });
};

exports.one = async function (request, result) {
    let groupDataRows = await db.selectWhereClause("groupData", "groupNum", request.body.groupNumber);
    let entryIds = [];
    for (let i = 0; i < groupDataRows.length; i++) {
        entryIds[i] = groupDataRows[i].wufooEntryId;
    }
    wufoo.getEntriesById(entryIds, async function (body) {
        body = JSON.parse(body);
        let rows = await db.selectWhereClause("groups", "groupNumber", request.body.groupNumber);
        let groupNumbers = util.getGroupNumbers(groupDataRows);
        result.render(util.views.GROUP, {
            isAdmin: true,
            groupData: rows[0], //only one group with that group number
            peopleInGroup: body,
            fields: con.groupFields,
            headings: con.headings,
            groupNumbers: groupNumbers
        });
    });
};