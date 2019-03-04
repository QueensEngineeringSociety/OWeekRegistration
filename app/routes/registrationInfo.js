const con = require("../../server/wufoo/wufooConstants");
const wufoo = require("../../server/wufoo/wufooApi.js");
const dbConn = require("../../config/database.js");
const util = require("../../app/util");

const query = wufoo.queries;

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
        dbConn.query("SELECT * FROM groupData", [], function (err, rows) {
            let groupNumbers = [];
            for (let i in rows) {
                groupNumbers[rows[i].wufooEntryId] = rows[i].groupNum; //i ID is unique
            }
            result.render('filter.ejs', {
                wufoo: body,
                groupNumbers: groupNumbers,
                operators: con.operators,
                fields: accessFields,
                headings: con.headings,
                isAdmin: admin,
                nextPage: nextPageNum,
                prevPage: prevPageNum,
                actionPath: "/filter"
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
        dbConn.query("SELECT * FROM groupData", [], function (err, rows) {
            let groupNumbers = [];
            for (let i in rows) {
                groupNumbers[rows[i].wufooEntryId] = rows[i].groupNum; //i ID is unique
            }
            result.render('filter.ejs', {
                wufoo: body,
                groupNumbers: groupNumbers,
                operators: con.operators,
                fields: accessFields,
                headings: con.headings,
                isAdmin: admin,
                nextPage: nextPageNum,
                prevPage: prevPageNum,
                actionPath: "/age"
            });
        });
    });
}

function getDisplayFood(request, result) {
    let pageNum = request.query.nextPage ? parseInt(request.query.nextPage) : 0;
    pageNum = request.query.prevPage ? parseInt(request.query.prevPage) : pageNum;
    wufoo.makePaginatedQuery(pageNum, query.foodRestrictions, function (body, nextPageNum, prevPageNum) {
        dbConn.query("SELECT * FROM groupData", [], function (err, rows) {
            let groupNumbers = [];
            for (let i in rows) {
                groupNumbers[rows[i].wufooEntryId] = rows[i].groupNum; //i ID is unique
            }
            result.render('filter.ejs', {
                wufoo: body,
                groupNumbers: groupNumbers,
                operators: con.operators,
                fields: con.allFields,
                headings: con.headings,
                isAdmin: true,
                nextPage: nextPageNum,
                prevPage: prevPageNum,
                actionPath: "/food_restrictions"
            });
        });
    });
}

function getDisplayPrimer(request, result) {
    let pageNum = request.query.nextPage ? parseInt(request.query.nextPage) : 0;
    pageNum = request.query.prevPage ? parseInt(request.query.prevPage) : pageNum;
    wufoo.makePaginatedQuery(pageNum, query.wantPrimer, function (body, nextPageNum, prevPageNum) {
        dbConn.query("SELECT * FROM groupData", [], function (err, rows) {
            let groupNumbers = [];
            for (let i in rows) {
                groupNumbers[rows[i].wufooEntryId] = rows[i].groupNum; //i ID is unique
            }
            result.render('filter.ejs', {
                wufoo: body,
                groupNumbers: groupNumbers,
                operators: con.operators,
                fields: con.allFields,
                headings: con.headings,
                isAdmin: true,
                nextPage: nextPageNum,
                prevPage: prevPageNum,
                actionPath: "/primer"
            });
        });
    });
}

function getDisplayMedical(request, result) {
    let pageNum = request.query.nextPage ? parseInt(request.query.nextPage) : 0;
    pageNum = request.query.prevPage ? parseInt(request.query.prevPage) : pageNum;
    wufoo.makePaginatedQuery(pageNum, query.medicalConcerns, function (body, nextPageNum, prevPageNum) {
        dbConn.query("SELECT * FROM groupData", [], function (err, rows) {
            let groupNumbers = [];
            for (let i in rows) {
                groupNumbers[rows[i].wufooEntryId] = rows[i].groupNum; //i ID is unique
            }
            result.render('filter.ejs', {
                wufoo: body,
                groupNumbers: groupNumbers,
                operators: con.operators,
                fields: con.allFields,
                headings: con.headings,
                isAdmin: true,
                nextPage: nextPageNum,
                prevPage: prevPageNum,
                actionPath: "/medical"
            });
        });
    });
}

function getDisplayPronouns(request, result) {
    let pageNum = request.query.nextPage ? parseInt(request.query.nextPage) : 0;
    pageNum = request.query.prevPage ? parseInt(request.query.prevPage) : pageNum;
    wufoo.makePaginatedQuery(pageNum, query.pronoun, function (body, nextPageNum, prevPageNum) {
        dbConn.query("SELECT * FROM groupData", [], function (err, rows) {
            let groupNumbers = [];
            for (let i in rows) {
                groupNumbers[rows[i].wufooEntryId] = rows[i].groupNum; //i ID is unique
            }
            result.render('filter.ejs', {
                wufoo: body,
                groupNumbers: groupNumbers,
                operators: con.operators,
                fields: con.allFields,
                headings: con.headings,
                isAdmin: true,
                nextPage: nextPageNum,
                prevPage: prevPageNum,
                actionPath: "/pronouns"
            });
        });
    });
}

function getDisplayAccessibility(request, result) {
    let pageNum = request.query.nextPage ? parseInt(request.query.nextPage) : 0;
    pageNum = request.query.prevPage ? parseInt(request.query.prevPage) : pageNum;
    wufoo.makePaginatedQuery(pageNum, query.accessibilityConcerns, function (body, nextPageNum, prevPageNum) {
        dbConn.query("SELECT * FROM groupData", [], function (err, rows) {
            let groupNumbers = [];
            for (let i in rows) {
                groupNumbers[rows[i].wufooEntryId] = rows[i].groupNum; //i ID is unique
            }
            result.render('filter.ejs', {
                wufoo: body,
                groupNumbers: groupNumbers,
                operators: con.operators,
                fields: con.allFields,
                headings: con.headings,
                isAdmin: true,
                nextPage: nextPageNum,
                prevPage: prevPageNum,
                actionPath: "/accessibility"
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
        dbConn.query("SELECT * FROM groupData", [], function (err, rows) {
            let groupNumbers = [];
            for (let i in rows) {
                groupNumbers[rows[i].wufooEntryId] = rows[i].groupNum; //i ID is unique
            }
            result.render('filter.ejs', {
                wufoo: body,
                groupNumbers: groupNumbers,
                operators: con.operators,
                fields: accessFields,
                headings: con.headings,
                isAdmin: admin,
                nextPage: nextPageNum,
                prevPage: prevPageNum,
                actionPath: "/payPerson"
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
        dbConn.query("SELECT * FROM groupData", [], function (err, rows) {
            let groupNumbers = [];
            for (let i in rows) {
                groupNumbers[rows[i].wufooEntryId] = rows[i].groupNum; //i ID is unique
            }
            result.render('filter.ejs', {
                wufoo: body,
                groupNumbers: groupNumbers,
                operators: con.operators,
                fields: accessFields,
                headings: con.headings,
                isAdmin: admin,
                nextPage: nextPageNum,
                prevPage: prevPageNum,
                actionPath: "/payMail"
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
        dbConn.query("SELECT * FROM groupData", [], function (err, rows) {
            let groupNumbers = [];
            for (let i in rows) {
                groupNumbers[rows[i].wufooEntryId] = rows[i].groupNum; //i ID is unique
            }
            res.render('filter.ejs', {
                wufoo: body,
                groupNumbers: groupNumbers,
                operators: con.operators,
                fields: accessFields,
                headings: con.headings,
                isAdmin: admin,
                nextPage: nextPageNum,
                prevPage: prevPageNum,
                actionPath: "/payOnline"
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
        dbConn.query("SELECT * FROM groupData", [], function (err, rows) {
            let groupNumbers = [];
            for (let i in rows) {
                groupNumbers[rows[i].wufooEntryId] = rows[i].groupNum; //i ID is unique
            }
            result.render('filter.ejs', {
                wufoo: body,
                groupNumbers: groupNumbers,
                operators: con.operators,
                fields: accessFields,
                headings: con.headings,
                isAdmin: admin,
                nextPage: nextPageNum,
                prevPage: prevPageNum,
                actionPath: "/unpaid"
            });
        });
    });
}