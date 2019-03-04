const con = require("../../server/wufoo/wufooConstants");
const wufoo = require("../../server/wufoo/wufooApi.js");
const builder = require("../../server/wufoo/wufooQueryBuilder");
const dbConn = require("../../config/database.js");
const util = require("../../app/util");

exports.get = {
    general: getGeneral,
    netid: getNetid
};

function getGeneral(request, result) {
    if (request.query['field'] && request.query['operator'] && request.query['value']) {
        let accessFields = con.generalFields;
        let admin = util.isAdmin(request);
        if (admin) {
            accessFields = con.allFields;
        }
        wufoo.makeQuery(builder.customQuery(request.query['field'], request.query['operator'], request.query['value']), function (body) {
            dbConn.query("SELECT * FROM groupData", [], function (err, rows) {
                let groupNumbers = [];
                for (let i in rows) {
                    groupNumbers[rows[i].wufooEntryId] = rows[i].groupNum; //i ID is unique
                }
                result.render('search.ejs', {
                    wufoo: body,
                    groupNumbers: groupNumbers,
                    operators: con.operators,
                    fields: accessFields,
                    headings: con.headings,
                    isAdmin: admin,
                    actionPath: "/search"
                });
            });
        });
    }
}

function getNetid(request,result){
    if (request.query['netid_search']) {
        let accessFields = con.generalFields;
        let admin = util.isAdmin(request);
        if (admin) {
            accessFields = con.allFields;
        }
        wufoo.makeQuery(builder.buildNetidQuery(request.query['netid_search']), function (body) {
            dbConn.query("SELECT * FROM groupData", [], function (err, rows) {
                let groupNumbers = [];
                for (let i in rows) {
                    groupNumbers[rows[i].wufooEntryId] = rows[i].groupNum; //i ID is unique
                }
                result.render('search.ejs', {
                    wufoo: body,
                    groupNumbers: groupNumbers,
                    operators: con.operators,
                    fields: accessFields,
                    headings: con.headings,
                    isAdmin: admin,
                    actionPath: "/netid"
                });
            });
        });
    }
}