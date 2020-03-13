const util = require("../controllerUtil");
const db = util.db;
const view = util.view;
const wufoo = util.wufoo;
const con = util.con;

exports.all = function (request, result) {
    db.query("SELECT maxNumOfGroups FROM groupMetaData", function (err, rows) {
        if (err) {
            view.renderError(result, "Cannot get number of groups.");
        } else {
            let maxNumOfGroups = rows[0].maxNumOfGroups;
            db.selectAll("groups", function (err, rows) {
                if (err) {
                    view.renderError(result, "No groups");
                } else {
                    result.render(util.views.GROUPS, {
                        groups: rows,
                        groupMax: maxNumOfGroups
                    });
                }
            });
        }
    });
};

exports.one = function (request, result) {
    db.selectWhereClause("groupData", "groupNum", request.body.groupNumber, function (err, groupDataRows) {
        if (!groupDataRows.length) {
            view.renderError(result, "Group is empty");
        } else {
            let entryIds = [];
            for (let i = 0; i < groupDataRows.length; i++) {
                entryIds[i] = groupDataRows[i].wufooEntryId;
            }
            wufoo.getEntriesById(entryIds, function (body) {
                body = JSON.parse(body);
                db.selectWhereClause("groups", "groupNumber", request.body.groupNumber, function (err, rows) {
                    if (!rows.length) {
                        view.renderError(result, `Group ${request.body.groupNumber} doesn't exist`);
                    } else {
                        let groupNumbers = util.getGroupNumbers(groupDataRows);
                        result.render(util.views.GROUP, {
                            isAdmin: true,
                            groupData: rows[0], //only one group with that group number
                            peopleInGroup: body,
                            fields: con.groupFields,
                            headings: con.headings,
                            groupNumbers: groupNumbers
                        });
                    }
                });
            });
        }
    });
};