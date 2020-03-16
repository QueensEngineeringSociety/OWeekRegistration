const wufoo = require("../wufoo/wufooApi.js");
const db = require("../database");
const util = require("../controllerUtil");

exports.general = async function (field, operator, value) {
    return await util.execute(`Could not search by ${field}`, true, util.views.SEARCH, async function () {
        let body = await wufoo.search(field, operator, value);
        let entries = util.pruneDuplicateFrosh(body);
        return await handleWufooData(entries);
    });
};

exports.netid = async function (netid) {
    return await util.execute("Could not search by netid", true, util.views.SEARCH, async function () {
        let body = await wufoo.netid(netid);
        let entries = util.pruneDuplicateFrosh(body);
        return await handleWufooData(entries);
    });
};

async function handleWufooData(body) {
    let rows = await db.get.allGroupData();
    let groupNumbers = util.getGroupNumbers(rows);
    return {data: {entries: body}, groupNumbers: groupNumbers};
}