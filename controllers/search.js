const wufoo = require("../models/wufoo/wufooApi.js");
const builder = require("../models/wufoo/wufooQueryBuilder");
const dbConn = require("../models/database/queries.js");
const util = require("../server/util");
const view = require("./rendering");
const controllerUtil = require("./controllerUtil");

const routes = util.routes;
const views = util.views;

exports.get = {
    general: getGeneral,
    netid: getNetid
};

function getGeneral(request, result) {
    if (request.query['field'] && request.query['operator'] && request.query['value']) {
        wufoo.makeQuery(0, builder.customQuery(request.query['field'], request.query['operator'], request.query['value']), [], async function (body) {
            let entries = controllerUtil.pruneDuplicateFrosh(JSON.parse(body));
            await handleWufooData(request, result, JSON.stringify(entries), routes.SEARCH);
        });
    }
}

function getNetid(request, result) {
    if (request.query['netid_search']) {
        wufoo.makeQuery(0, builder.buildNetidQuery(request.query['netid_search']), [], async function (body) {
            let entries = controllerUtil.pruneDuplicateFrosh(JSON.parse(body));
            await handleWufooData(request, result, JSON.stringify(entries), routes.NET_ID);
        });
    }
}

async function handleWufooData(request, result, body, route) {
    let rows = dbConn.selectAll("groupData");
    let groupNumbers = controllerUtil.getGroupNumbers(rows);
    view.render(result, views.SEARCH, request, body, groupNumbers, route);
}