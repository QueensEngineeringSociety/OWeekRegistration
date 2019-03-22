const wufoo = require("../../server/wufoo/wufooApi.js");
const dbConn = require("../../config/database/queries.js");
const constants = require("../../server/util");
const view = require("./rendering");

const query = wufoo.queries;
const views = constants.views;
const routes = constants.routes;

exports.get = {
    displayAll: getDisplayAll,
    displayAge: getDisplayAge,
    displayFood: getDisplayFood,
    displayPrimer: getDisplayPrimer,
    displayMedical: getDisplayMedical,
    displayPronouns: getDisplayPronouns,
    displayAccessibility: getDisplayAccessibility,
    displayPayPerson: getDisplayPayPerson,
    displayPayMail: getDisplayPayMail,
    displayPayOnline: getDisplayPayOnline,
    displayUnpaid: getDisplayUnpaid
};

function getDisplayAll(request, result) {
    getRequest(request, result, query.all, routes.FILTER);
}

function getDisplayAge(request, result) {
    getRequest(request, result, query.age, routes.AGE);
}

function getDisplayFood(request, result) {
    getRequest(request, result, query.foodRestrictions, routes.FOOD_RESTRICTIONS);
}

function getDisplayPrimer(request, result) {
    getRequest(request, result, query.wantPrimer, routes.PRIMER);
}

function getDisplayMedical(request, result) {
    getRequest(request, result, query.medicalConcerns, routes.MEDICAL);
}

function getDisplayPronouns(request, result) {
    getRequest(request, result, query.pronoun, routes.PRONOUNS);
}

function getDisplayAccessibility(request, result) {
    getRequest(request, result, query.accessibilityConcerns, routes.ACCESSIBILITY);
}

function getDisplayPayPerson(request, result) {
    getRequest(request, result, query.payInPerson, routes.PAY_PERSON);
}

function getDisplayPayMail(request, result) {
    getRequest(request, result, query.payByMail, routes.PAY_MAIL);
}

function getDisplayPayOnline(request, result) {
    getRequest(request, result, query.payOnline, routes.PAY_ONLINE);
}

function getDisplayUnpaid(request, result) {
    getRequest(request, result, query.unpaid, routes.UNPAID);
}

function getRequest(request, result, query, route){
    let pageNum = getPageNum(request);
    wufoo.makePaginatedQuery(pageNum, query, function (body, nextPageNum, prevPageNum) {
        dbConn.selectAll("groupData", function (err, rows) {
            let groupNumbers = getGroupNumbers(rows);
            view.renderPaginated(result, views.FILTER, request, body, groupNumbers, route, nextPageNum, prevPageNum);
        });
    });
}

function getGroupNumbers(rows) {
    let groupNumbers = [];
    for (let i in rows) {
        groupNumbers[rows[i].wufooEntryId] = rows[i].groupNum; //i ID is unique
    }
    return groupNumbers;
}

function getPageNum(request){
    let pageNum = request.query.nextPage ? parseInt(request.query.nextPage) : 0;
    return request.query.prevPage ? parseInt(request.query.prevPage) : pageNum;
}