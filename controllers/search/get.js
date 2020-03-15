const wufoo = require("../../models/wufoo/wufooApi.js");
const builder = require("../../models/wufoo/wufooQueryBuilder");
const db = require("../../models/database/queries.js");
const util = require("../controllerUtil");

exports.general = async function (field, operator, value) {
    return await util.execute("get", "search general", true, util.views.SEARCH, async function () {
        let body = await wufoo.makeQuery(0, builder.customQuery(field, operator, value), []);
        let entries = util.pruneDuplicateFrosh(JSON.parse(body));
        return await handleWufooData(entries);
    });
};

exports.netid = async function (netid) {
    return await util.execute("get", "search netid", true, util.views.SEARCH, async function () {
        let body = await wufoo.makeQuery(0, builder.buildNetidQuery(netid), []);
        let entries = util.pruneDuplicateFrosh(JSON.parse(body));
        return await handleWufooData(entries);
    });
};

async function handleWufooData(body) {
    let rows = await db.selectAll("groupData");
    let groupNumbers = util.getGroupNumbers(rows);
    return {data: {entries: body}, groupNumbers: groupNumbers};
}