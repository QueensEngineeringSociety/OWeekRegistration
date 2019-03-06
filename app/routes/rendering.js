const con = require("../../server/wufoo/wufooConstants");
const util = require("../../server/util");

const views = util.views;

let renderObject = {
    operators: con.operators,
    headings: con.headings
};

exports.render = function (result, view, request, wufooData, groupNumbers, actionPath) {
    result.render(view, buildRenderObject(request, wufooData, groupNumbers, actionPath));
};

exports.renderError = function (result, message) {
    result.render(views.ERROR, {errorMessage: message});
};

function buildRenderObject(request, wufooData, groupNumbers, actionPath) {
    let isAdmin = util.isAdmin(request);
    renderObject.fields = getAccessibleFields(isAdmin);
    renderObject.isAdmin = isAdmin;
    renderObject.wufoo = wufooData;
    renderObject.groupNumbers = groupNumbers;
    renderObject.actionPath = actionPath;
    return renderObject;
}

function getAccessibleFields(isAdmin) {
    return isAdmin ? con.allFields : con.generalFields;
}