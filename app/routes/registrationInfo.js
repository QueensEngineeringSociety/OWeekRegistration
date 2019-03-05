const con = require("../../server/wufoo/wufooConstants");
const wufoo = require("../../server/wufoo/wufooApi.js");
const dbConn = require("../../config/database/queries.js");
const util = require("../../server/util");
const constants = require("../../server/util");

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
    let accessFields = con.generalFields;
    let admin = util.isAdmin(request);
    if (admin) {
        accessFields = con.allFields;
    }
    let pageNum = request.query.nextPage ? parseInt(request.query.nextPage) : 0;
    pageNum = request.query.prevPage ? parseInt(request.query.prevPage) : pageNum;
    wufoo.makePaginatedQuery(pageNum, query.all, function (body, nextPageNum, prevPageNum) {
        dbConn.selectAll("groupData", function (err, rows) {
            let groupNumbers = [];
            for (let i in rows) {
                groupNumbers[rows[i].wufooEntryId] = rows[i].groupNum; //i ID is unique
            }
            result.render(views.FILTER, {
                wufoo: body,
                groupNumbers: groupNumbers,
                operators: con.operators,
                fields: accessFields,
                headings: con.headings,
                isAdmin: admin,
                nextPage: nextPageNum,
                prevPage: prevPageNum,
                actionPath: routes.FILTER
            });
        });
    });
}

function getDisplayAge(request, result) {
    let accessFields = con.generalFields;
    let admin = util.isAdmin(request);
    if (admin) {
        accessFields = con.allFields;
    }
    let pageNum = request.query.nextPage ? parseInt(request.query.nextPage) : 0;
    pageNum = request.query.prevPage ? parseInt(request.query.prevPage) : pageNum;
    wufoo.makePaginatedQuery(pageNum, query.age, function (body, nextPageNum, prevPageNum) {
        dbConn.selectAll("groupData", function (err, rows) {
            let groupNumbers = [];
            for (let i in rows) {
                groupNumbers[rows[i].wufooEntryId] = rows[i].groupNum; //i ID is unique
            }
            result.render(views.FILTER, {
                wufoo: body,
                groupNumbers: groupNumbers,
                operators: con.operators,
                fields: accessFields,
                headings: con.headings,
                isAdmin: admin,
                nextPage: nextPageNum,
                prevPage: prevPageNum,
                actionPath: routes.AGE
            });
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
            result.render(views.FILTER, {
                wufoo: body,
                groupNumbers: groupNumbers,
                operators: con.operators,
                fields: con.allFields,
                headings: con.headings,
                isAdmin: true,
                nextPage: nextPageNum,
                prevPage: prevPageNum,
                actionPath: routes.FOOD_RESTRICTIONS
            });
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
            result.render(views.FILTER, {
                wufoo: body,
                groupNumbers: groupNumbers,
                operators: con.operators,
                fields: con.allFields,
                headings: con.headings,
                isAdmin: true,
                nextPage: nextPageNum,
                prevPage: prevPageNum,
                actionPath: routes.PRIMER
            });
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
            result.render(views.FILTER, {
                wufoo: body,
                groupNumbers: groupNumbers,
                operators: con.operators,
                fields: con.allFields,
                headings: con.headings,
                isAdmin: true,
                nextPage: nextPageNum,
                prevPage: prevPageNum,
                actionPath: routes.MEDICAL
            });
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
            result.render(views.FILTER, {
                wufoo: body,
                groupNumbers: groupNumbers,
                operators: con.operators,
                fields: con.allFields,
                headings: con.headings,
                isAdmin: true,
                nextPage: nextPageNum,
                prevPage: prevPageNum,
                actionPath: routes.PRONOUNS
            });
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
            result.render(views.FILTER, {
                wufoo: body,
                groupNumbers: groupNumbers,
                operators: con.operators,
                fields: con.allFields,
                headings: con.headings,
                isAdmin: true,
                nextPage: nextPageNum,
                prevPage: prevPageNum,
                actionPath: routes.ACCESSIBILITY
            });
        });
    });
}

function getDisplayPayPerson(request, result) {
    let accessFields = con.generalFields;
    let admin = util.isAdmin(request);
    if (admin) {
        accessFields = con.allFields;
    }
    let pageNum = request.query.nextPage ? parseInt(request.query.nextPage) : 0;
    pageNum = request.query.prevPage ? parseInt(request.query.prevPage) : pageNum;
    wufoo.makePaginatedQuery(pageNum, query.payInPerson, function (body, nextPageNum, prevPageNum) {
        dbConn.selectAll("groupData", function (err, rows) {
            let groupNumbers = [];
            for (let i in rows) {
                groupNumbers[rows[i].wufooEntryId] = rows[i].groupNum; //i ID is unique
            }
            result.render(views.FILTER, {
                wufoo: body,
                groupNumbers: groupNumbers,
                operators: con.operators,
                fields: accessFields,
                headings: con.headings,
                isAdmin: admin,
                nextPage: nextPageNum,
                prevPage: prevPageNum,
                actionPath: routes.PAY_PERSON
            });
        });
    });
}

function getDisplayPayMail(request, result) {
    let accessFields = con.generalFields;
    let admin = util.isAdmin(request);
    if (admin) {
        accessFields = con.allFields;
    }
    let pageNum = request.query.nextPage ? parseInt(request.query.nextPage) : 0;
    pageNum = request.query.prevPage ? parseInt(request.query.prevPage) : pageNum;
    wufoo.makePaginatedQuery(pageNum, query.payByMail, function (body, nextPageNum, prevPageNum) {
        dbConn.selectAll("groupData", function (err, rows) {
            let groupNumbers = [];
            for (let i in rows) {
                groupNumbers[rows[i].wufooEntryId] = rows[i].groupNum; //i ID is unique
            }
            result.render(views.FILTER, {
                wufoo: body,
                groupNumbers: groupNumbers,
                operators: con.operators,
                fields: accessFields,
                headings: con.headings,
                isAdmin: admin,
                nextPage: nextPageNum,
                prevPage: prevPageNum,
                actionPath: routes.PAY_MAIL
            });
        });
    });
}

function getDisplayPayOnline(req, res) {
    let accessFields = con.generalFields;
    let admin = util.isAdmin(req);
    if (admin) {
        accessFields = con.allFields;
    }
    let pageNum = req.query.nextPage ? parseInt(req.query.nextPage) : 0;
    pageNum = req.query.prevPage ? parseInt(req.query.prevPage) : pageNum;
    wufoo.makePaginatedQuery(pageNum, query.payOnline, function (body, nextPageNum, prevPageNum) {
        dbConn.selectAll("groupData", function (err, rows) {
            let groupNumbers = [];
            for (let i in rows) {
                groupNumbers[rows[i].wufooEntryId] = rows[i].groupNum; //i ID is unique
            }
            res.render(views.FILTER, {
                wufoo: body,
                groupNumbers: groupNumbers,
                operators: con.operators,
                fields: accessFields,
                headings: con.headings,
                isAdmin: admin,
                nextPage: nextPageNum,
                prevPage: prevPageNum,
                actionPath: routes.PAY_ONLINE
            });
        });
    });
}

function getDisplayUnpaid(request, result) {
    let accessFields = con.generalFields;
    let admin = util.isAdmin(request);
    if (admin) {
        accessFields = con.allFields;
    }
    let pageNum = request.query.nextPage ? parseInt(request.query.nextPage) : 0;
    pageNum = request.query.prevPage ? parseInt(request.query.prevPage) : pageNum;
    wufoo.makePaginatedQuery(pageNum, query.unpaid, function (body, nextPageNum, prevPageNum) {
        dbConn.selectAll("groupData", function (err, rows) {
            let groupNumbers = [];
            for (let i in rows) {
                groupNumbers[rows[i].wufooEntryId] = rows[i].groupNum; //i ID is unique
            }
            result.render(views.FILTER, {
                wufoo: body,
                groupNumbers: groupNumbers,
                operators: con.operators,
                fields: accessFields,
                headings: con.headings,
                isAdmin: admin,
                nextPage: nextPageNum,
                prevPage: prevPageNum,
                actionPath: routes.UNPAID
            });
        });
    });
}