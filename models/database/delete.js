const util = require("./dbUtil");

exports.user = async function (user) {
    return await execute(util.table.USERS, user);
};

exports.groupData = async function (groupData) {
    return await execute(util.table.GROUP_DATA, groupData);
};

exports.groupMetaData = async function (groupMetaData) {
    return await execute(util.table.GROUP_META_DATA, groupMetaData);
};

exports.group = async function (group) {
    return await execute(util.table.GROUPS, group);
};

async function execute(table, model) {
    return await util.query(util.build.delete(table, model.keyField()), [model.keyValue()]);
}