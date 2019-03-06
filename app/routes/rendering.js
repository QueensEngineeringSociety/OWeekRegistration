const con = require("../../server/wufoo/wufooConstants");
const views = require("../../server/util").views;

exports.render = function (result, view) {
    result.render(view, {});
};

exports.renderError = function (result, message) {
    result.render(views.ERROR, {errorMessage: message});
};