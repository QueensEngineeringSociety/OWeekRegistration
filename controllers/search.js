const wufoo = require("../models/wufoo/wufooApi.js");
const builder = require("../models/wufoo/wufooQueryBuilder");
const dbConn = require("../models/database/queries.js");
const util = require("../server/util");
const view = require("./rendering");
const controllerUtil = require("./controllerUtil");

const routes = util.routes;
const views = util.views;

exports.get = {};

exports.get.general = async function (request, result) {
    if (request.query['field'] && request.query['operator'] && request.query['value']) {
        let body = await wufoo.makeQuery(0, builder.customQuery(request.query['field'], request.query['operator'], request.query['value']), []);
        let entries = controllerUtil.pruneDuplicateFrosh(JSON.parse(body));
        await handleWufooData(request, result, JSON.stringify(entries), routes.SEARCH);
    }
};

exports.get.netid = async function (request, result) {
    if (request.query['netid_search']) {
        let body = await wufoo.makeQuery(0, builder.buildNetidQuery(request.query['netid_search']), []);
        let entries = controllerUtil.pruneDuplicateFrosh(JSON.parse(body));
        await handleWufooData(request, result, JSON.stringify(entries), routes.NET_ID);
    }
};

async function handleWufooData(request, result, body, route) {
    let rows = dbConn.selectAll("groupData");
    let groupNumbers = controllerUtil.getGroupNumbers(rows);
    view.render(result, views.SEARCH, request, body, groupNumbers, route);
}