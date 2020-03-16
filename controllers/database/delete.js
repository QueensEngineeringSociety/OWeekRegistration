const util = require("./dbUtil");
const model = require("../../models");

exports.user = async function (username) {
    return await util.query(util.build.delete(util.table.USERS, model.User.keyField()), [username]);
};

exports.allGroupData = async function () {
    return await util.query(util.build.delete(util.table.GROUP_DATA));
};

exports.allGroups = async function () {
    return await util.query(util.build.delete(util.table.GROUPS));
};