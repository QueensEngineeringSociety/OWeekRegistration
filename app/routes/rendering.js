const con = require("../../server/wufoo/wufooConstants");
const util = require("../../server/util");

const views = util.views;

let renderObject = {
    operators: con.operators,
    headings: con.headings,
    nextPage: -1,
    prevPage: -1
};

exports.simpleRender = function (result, view) {
    result.render(view);
};

exports.render = function (result, view, request, wufooData, groupNumbers, actionPath) {
    result.render(view, buildRenderObject(request, wufooData, groupNumbers, actionPath));
};

exports.renderPaginated = function (result, view, request, wufooData, groupNumbers, actionPath, nextPageNum, prevPageNum) {
    result.render(view, buildRenderObject(request, wufooData, groupNumbers, actionPath, nextPageNum, prevPageNum));
};

exports.renderError = function (result, message) {
    result.render(views.ERROR, {errorMessage: message});
};

function buildRenderObject(request, wufooData, groupNumbers, actionPath, nextPageNum = -1, prevPageNum = -1) {
    let isAdmin = util.isAdmin(request);
    renderObject.fields = con.getAccessibleFields(isAdmin);
    renderObject.isAdmin = isAdmin;
    renderObject.wufoo = wufooData;
    renderObject.groupNumbers = groupNumbers;
    renderObject.actionPath = actionPath;
    renderObject.nextPage = nextPageNum;
    renderObject.prevPage = prevPageNum;
    return renderObject;
}