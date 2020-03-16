const util = require("./dbUtil");
const model = require("../../models");

exports.user = async function (user) {
    return await execute(user, util.table.USERS);
};

exports.group = async function (groupData) {
    return await execute(groupData, util.table.GROUP_DATA);
};

exports.groupNumberCounters = async function (newManNum, newWomanNum) {
    return await util.query(util.build.update(util.table.GROUP_META_DATA, model.GroupMetaData.zeroFields(), model.GroupMetaData.keyField()), [1, newManNum, newWomanNum]);
};

exports.maxNumberOfGroups = async function (newMaxNum) {
    return await util.query(util.build.update(util.table.GROUP_META_DATA, ["maxNumOfGroups"], model.GroupMetaData.keyField()), [1, newMaxNum]);
};

exports.groups = async function (groups) {
    return await execute(groups, util.table.GROUPS);
};

async function execute(model, table) {
    let values = model.values().concat(model.updateValues());
    return await util.query(util.build.insert(table, model.fields(), model.updateFields()), values);
}