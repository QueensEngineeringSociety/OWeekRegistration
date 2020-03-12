const xlsx = require("xlsx");
const fs = require("fs");

const wufoo = require("../models/wufoo/wufooApi.js");
const wufooCon = require("../models/wufoo/wufooConstants");
const dbConn = require("../models/database/queries.js");
const util = require("../server/util");
const view = require("./rendering");

const query = wufoo.queries;
const views = util.views;
const routes = util.routes;

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
    displayUnpaid: getDisplayUnpaid,
    registrationCsv: getRegistrationExcel
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

function getRegistrationExcel(req, res) {
    wufoo.makeQuery(0, query.all, [], function (entries) {
        entries = JSON.parse(entries);
        let workbook = xlsx.utils.book_new();
        let groups = {};
        dbConn.selectAll("groupData", function (err, rows) {
            let groupNumbers = util.getGroupNumbers(rows);
            for (let entry of entries) {
                let num = groupNumbers[entry.EntryId] + 1;
                if (groups[num]) {
                    groups[num].members = groups[num].members.concat(entry);
                } else {
                    groups[num] = {members: [entry]};
                }
            }
            for (let groupNum in groups) {
                let dirtyPeople = groups[groupNum].members;
                let cleanPeople = [];
                for (let person of dirtyPeople) {
                    cleanPeople.push(clean(person));
                }
                let workSheet = xlsx.utils.json_to_sheet(cleanPeople);
                xlsx.utils.book_append_sheet(workbook, workSheet, "Group " + groupNum);

            }
            xlsx.writeFile(workbook, "Exported-Group-Data.xlsx");
            res.download(__dirname + "/../../server/Exported-Group-Data.xlsx", function () {
                fs.unlink(__dirname + "/../../server/Exported-Group-Data.xlsx", (err) => {
                    if (err) throw err;
                });
            });
        });
    });
}

function clean(person) {
    let fields = wufooCon.getAccessibleFields(true);
    let cleanedPerson = {};
    for (let fp in person) {
        for (let f in fields) {
            if (fp === fields[f]) {
                cleanedPerson[f] = person[fp];
            }
        }
    }
    return cleanedPerson;
}

function getRequest(request, result, query, route) {
    let pageNum = getPageNum(request);
    wufoo.makePaginatedQuery(pageNum, query, function (body, nextPageNum, prevPageNum) {
        let entries = util.pruneDuplicateFrosh(JSON.parse(body));
        dbConn.selectAll("groupData", function (err, rows) {
            let groupNumbers = util.getGroupNumbers(rows);
            view.renderPaginated(result, views.FILTER, request, JSON.stringify(entries), groupNumbers, route, nextPageNum, prevPageNum);
        });
    });
}

function getPageNum(request) {
    let pageNum = request.query.nextPage ? parseInt(request.query.nextPage) : 0;
    return request.query.prevPage ? parseInt(request.query.prevPage) : pageNum;
}