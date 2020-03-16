const model = require("../../models");
const util = require("./dbUtil");

exports.allUsers = async function () {
    return await util.query(util.build.select(model.User.getFields(), util.table.USERS));
};

exports.user = async function (username) {
    return await util.query(util.build.select("*", util.table.USERS, model.User.keyField()), [username]);
};

exports.allGroups = async function () {
    return await execute(util.table.GROUPS, model.Group.fromDb);
};

exports.group = async function (groupNumber) {
    return await util.query(util.build.select("*", util.table.GROUPS, model.Group.keyField()), [groupNumber]);
};

exports.membersOfGroup = async function (groupNumber) {
    return await util.query(util.build.select("*", util.table.GROUP_DATA, model.GroupData.keyField()), [groupNumber]);
};

exports.allGroupData = async function () {
    return await execute(util.table.GROUP_DATA, model.GroupData.fromDb);
};

exports.groupMetaData = async function () {
    return await execute(util.table.GROUP_META_DATA, model.GroupMetaData.fromDb);
};

async function execute(table, modelCreatorFunction) {
    let rows = await util.query(util.build.select("*", table));
    return modelCreatorFunction(rows);
}