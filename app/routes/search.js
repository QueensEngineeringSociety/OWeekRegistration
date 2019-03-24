const wufoo = require("../../server/wufoo/wufooApi.js");
const builder = require("../../server/wufoo/wufooQueryBuilder");
const dbConn = require("../../config/database/queries.js");
const util = require("../../server/util");
const view = require("./rendering");

const routes = util.routes;
const views = util.views;

exports.get = {
    general: getGeneral,
    netid: getNetid
};

function getGeneral(request, result) {
    if (request.query['field'] && request.query['operator'] && request.query['value']) {
        wufoo.makeQuery(builder.customQuery(request.query['field'], request.query['operator'], request.query['value']), function (body) {
            handleWufooData(request, result, body, routes.SEARCH);
        });
    }
}

function getNetid(request, result) {
    if (request.query['netid_search']) {
        wufoo.makeQuery(builder.buildNetidQuery(request.query['netid_search']), function (body) {
            handleWufooData(request, result, body, routes.NET_ID);
        });
    }
}

function handleWufooData(request, result, body, route) {
    dbConn.selectAll("groupData", function (err, rows) {
        let groupNumbers = util.getGroupNumbers(rows);
        view.render(result, views.SEARCH, request, body, groupNumbers, route);
    });
}