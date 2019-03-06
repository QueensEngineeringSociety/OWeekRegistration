const con = require("../../server/wufoo/wufooConstants");
const wufoo = require("../../server/wufoo/wufooApi.js");
const builder = require("../../server/wufoo/wufooQueryBuilder");
const dbConn = require("../../config/database/queries.js");
const util = require("../../server/util");
const constants = require("../../server/util");
const view = require("./rendering");

const routes = constants.routes;
const views = constants.views;

exports.get = {
    general: getGeneral,
    netid: getNetid
};

function getGeneral(request, result) {
    if (request.query['field'] && request.query['operator'] && request.query['value']) {
        wufoo.makeQuery(builder.customQuery(request.query['field'], request.query['operator'], request.query['value']), function (body) {
            dbConn.selectAll("groupData", function (err, rows) {
                let groupNumbers = [];
                for (let i in rows) {
                    groupNumbers[rows[i].wufooEntryId] = rows[i].groupNum; //i ID is unique
                }
                view.render(result, views.SEARCH, request, body, groupNumbers, routes.SEARCH);
            });
        });
    }
}

function getNetid(request, result) {
    if (request.query['netid_search']) {
        wufoo.makeQuery(builder.buildNetidQuery(request.query['netid_search']), function (body) {
            dbConn.selectAll("groupData", function (err, rows) {
                let groupNumbers = [];
                for (let i in rows) {
                    groupNumbers[rows[i].wufooEntryId] = rows[i].groupNum; //i ID is unique
                }
                view.render(result, views.SEARCH, request, body, groupNumbers, routes.NET_ID);
            });
        });
    }
}