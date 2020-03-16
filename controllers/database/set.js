const util = require("./dbUtil");
const model = require("../../models");

exports.user = async function (user) {
    return await execute(user, util.table.USERS);
};

exports.group = async function (group) {
    return await execute(group, util.table.GROUPS);
};

exports.groupMember = async function (groupData) {
    return await execute(groupData, util.table.GROUP_DATA);
};

exports.groupNumberCounters = async function (newManNum, newWomanNum) {
    return await util.query(util.build.update(util.table.GROUP_META_DATA, model.GroupMetaData.zeroFields(), model.GroupMetaData.keyField()), [1, newManNum, newWomanNum]);
};

exports.maxNumberOfGroups = async function (newMaxNum) {
    return await util.query(util.build.update(util.table.GROUP_META_DATA, ["maxNumOfGroups"], model.GroupMetaData.keyField()), [newMaxNum, 1]); //only one row, ID is 1
};

async function execute(model, table) {
    let values = model.values().concat(model.updateValues());
    return await util.query(util.build.insert(table, model.fields(), model.updateFields()), values);
}