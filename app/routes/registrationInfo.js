const con = require("../../server/wufoo/wufooConstants");
const wufoo = require("../../server/wufoo/wufooApi.js");
const dbConn = require("../../config/database/queries.js");
const util = require("../../server/util");
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
    let pageNum = request.query.nextPage ? parseInt(request.query.nextPage) : 0;
    pageNum = request.query.prevPage ? parseInt(request.query.prevPage) : pageNum;
    wufoo.makePaginatedQuery(pageNum, query.all, function (body, nextPageNum, prevPageNum) {
        dbConn.selectAll("groupData", function (err, rows) {
            let groupNumbers = [];
            for (let i in rows) {
                groupNumbers[rows[i].wufooEntryId] = rows[i].groupNum; //i ID is unique
            }
            view.renderPaginated(result, views.FILTER, request, body, groupNumbers, routes.FILTER, nextPageNum, prevPageNum);
        });
    });
}

function getDisplayAge(request, result) {
    let pageNum = request.query.nextPage ? parseInt(request.query.nextPage) : 0;
    pageNum = request.query.prevPage ? parseInt(request.query.prevPage) : pageNum;
    wufoo.makePaginatedQuery(pageNum, query.age, function (body, nextPageNum, prevPageNum) {
        dbConn.selectAll("groupData", function (err, rows) {
            let groupNumbers = [];
            for (let i in rows) {
                groupNumbers[rows[i].wufooEntryId] = rows[i].groupNum; //i ID is unique
            }
            view.renderPaginated(result, views.FILTER, request, body, groupNumbers, routes.AGE, nextPageNum, prevPageNum);
        });
    });
}

function getDisplayFood(request, result) {
    let pageNum = request.query.nextPage ? parseInt(request.query.nextPage) : 0;
    pageNum = request.query.prevPage ? parseInt(request.query.prevPage) : pageNum;
    wufoo.makePaginatedQuery(pageNum, query.foodRestrictions, function (body, nextPageNum, prevPageNum) {
        dbConn.selectAll("groupData", function (err, rows) {
            let groupNumbers = [];
            for (let i in rows) {
                groupNumbers[rows[i].wufooEntryId] = rows[i].groupNum; //i ID is unique
            }
            view.renderPaginated(result, views.FILTER, request, body, groupNumbers, routes.FOOD_RESTRICTIONS, nextPageNum, prevPageNum);
        });
    });
}

function getDisplayPrimer(request, result) {
    let pageNum = request.query.nextPage ? parseInt(request.query.nextPage) : 0;
    pageNum = request.query.prevPage ? parseInt(request.query.prevPage) : pageNum;
    wufoo.makePaginatedQuery(pageNum, query.wantPrimer, function (body, nextPageNum, prevPageNum) {
        dbConn.selectAll("groupData", function (err, rows) {
            let groupNumbers = [];
            for (let i in rows) {
                groupNumbers[rows[i].wufooEntryId] = rows[i].groupNum; //i ID is unique
            }
            view.renderPaginated(result, views.FILTER, request, body, groupNumbers, routes.PRIMER, nextPageNum, prevPageNum);
        });
    });
}

function getDisplayMedical(request, result) {
    let pageNum = request.query.nextPage ? parseInt(request.query.nextPage) : 0;
    pageNum = request.query.prevPage ? parseInt(request.query.prevPage) : pageNum;
    wufoo.makePaginatedQuery(pageNum, query.medicalConcerns, function (body, nextPageNum, prevPageNum) {
        dbConn.selectAll("groupData", function (err, rows) {
            let groupNumbers = [];
            for (let i in rows) {
                groupNumbers[rows[i].wufooEntryId] = rows[i].groupNum; //i ID is unique
            }
            view.renderPaginated(result, views.FILTER, request, body, groupNumbers, routes.MEDICAL, nextPageNum, prevPageNum);
        });
    });
}

function getDisplayPronouns(request, result) {
    let pageNum = request.query.nextPage ? parseInt(request.query.nextPage) : 0;
    pageNum = request.query.prevPage ? parseInt(request.query.prevPage) : pageNum;
    wufoo.makePaginatedQuery(pageNum, query.pronoun, function (body, nextPageNum, prevPageNum) {
        dbConn.selectAll("groupData", function (err, rows) {
            let groupNumbers = [];
            for (let i in rows) {
                groupNumbers[rows[i].wufooEntryId] = rows[i].groupNum; //i ID is unique
            }
            view.renderPaginated(result, views.FILTER, request, body, groupNumbers, routes.PRONOUNS, nextPageNum, prevPageNum);
        });
    });
}

function getDisplayAccessibility(request, result) {
    let pageNum = request.query.nextPage ? parseInt(request.query.nextPage) : 0;
    pageNum = request.query.prevPage ? parseInt(request.query.prevPage) : pageNum;
    wufoo.makePaginatedQuery(pageNum, query.accessibilityConcerns, function (body, nextPageNum, prevPageNum) {
        dbConn.selectAll("groupData", function (err, rows) {
            let groupNumbers = [];
            for (let i in rows) {
                groupNumbers[rows[i].wufooEntryId] = rows[i].groupNum; //i ID is unique
            }
            view.renderPaginated(result, views.FILTER, request, body, groupNumbers, routes.ACCESSIBILITY, nextPageNum, prevPageNum);
        });
    });
}

function getDisplayPayPerson(request, result) {
    let pageNum = request.query.nextPage ? parseInt(request.query.nextPage) : 0;
    pageNum = request.query.prevPage ? parseInt(request.query.prevPage) : pageNum;
    wufoo.makePaginatedQuery(pageNum, query.payInPerson, function (body, nextPageNum, prevPageNum) {
        dbConn.selectAll("groupData", function (err, rows) {
            let groupNumbers = [];
            for (let i in rows) {
                groupNumbers[rows[i].wufooEntryId] = rows[i].groupNum; //i ID is unique
            }
            view.renderPaginated(result, views.FILTER, request, body, groupNumbers, routes.PAY_PERSON, nextPageNum, prevPageNum);
        });
    });
}

function getDisplayPayMail(request, result) {
    let pageNum = request.query.nextPage ? parseInt(request.query.nextPage) : 0;
    pageNum = request.query.prevPage ? parseInt(request.query.prevPage) : pageNum;
    wufoo.makePaginatedQuery(pageNum, query.payByMail, function (body, nextPageNum, prevPageNum) {
        dbConn.selectAll("groupData", function (err, rows) {
            let groupNumbers = [];
            for (let i in rows) {
                groupNumbers[rows[i].wufooEntryId] = rows[i].groupNum; //i ID is unique
            }
            view.renderPaginated(result, views.FILTER, request, body, groupNumbers, routes.PAY_MAIL, nextPageNum, prevPageNum);
        });
    });
}

function getDisplayPayOnline(request, result) {
    let pageNum = request.query.nextPage ? parseInt(request.query.nextPage) : 0;
    pageNum = request.query.prevPage ? parseInt(request.query.prevPage) : pageNum;
    wufoo.makePaginatedQuery(pageNum, query.payOnline, function (body, nextPageNum, prevPageNum) {
        dbConn.selectAll("groupData", function (err, rows) {
            let groupNumbers = [];
            for (let i in rows) {
                groupNumbers[rows[i].wufooEntryId] = rows[i].groupNum; //i ID is unique
            }
            view.renderPaginated(result, views.FILTER, request, body, groupNumbers, routes.PAY_ONLINE, nextPageNum, prevPageNum);
        });
    });
}

function getDisplayUnpaid(request, result) {
    let pageNum = request.query.nextPage ? parseInt(request.query.nextPage) : 0;
    pageNum = request.query.prevPage ? parseInt(request.query.prevPage) : pageNum;
    wufoo.makePaginatedQuery(pageNum, query.unpaid, function (body, nextPageNum, prevPageNum) {
        dbConn.selectAll("groupData", function (err, rows) {
            let groupNumbers = [];
            for (let i in rows) {
                groupNumbers[rows[i].wufooEntryId] = rows[i].groupNum; //i ID is unique
            }
            view.renderPaginated(result, views.FILTER, request, body, groupNumbers, routes.UNPAID, nextPageNum, prevPageNum);
        });
    });
}