const xlsx = require("xlsx");
const fs = require("fs");
const util = require("../controllerUtil");
const db = util.db;
const view = util.view;
const wufoo = util.wufoo;

exports.all = function (request, result) {
    getRequest(request, result, util.query.all, util.routes.FILTER);
};

exports.age = function (request, result) {
    getRequest(request, result, util.query.age, util.routes.AGE);
};

exports.food = function (request, result) {
    getRequest(request, result, util.query.foodRestrictions, util.routes.FOOD_RESTRICTIONS);
};

exports.primer = function (request, result) {
    getRequest(request, result, util.query.wantPrimer, util.routes.PRIMER);
};

exports.medical = function (request, result) {
    getRequest(request, result, util.query.medicalConcerns, util.routes.MEDICAL);
};

exports.pronouns = function (request, result) {
    getRequest(request, result, util.query.pronoun, util.routes.PRONOUNS);
};

exports.accessibility = function (request, result) {
    getRequest(request, result, util.query.accessibilityConcerns, util.routes.ACCESSIBILITY);
};

exports.payPerson = function (request, result) {
    getRequest(request, result, util.query.payInPerson, util.routes.PAY_PERSON);
};

exports.payMail = function (request, result) {
    getRequest(request, result, util.query.payByMail, util.routes.PAY_MAIL);
};

exports.payOnline = function (request, result) {
    getRequest(request, result, util.query.payOnline, util.routes.PAY_ONLINE);
};

exports.unpaid = function (request, result) {
    getRequest(request, result, util.query.unpaid, util.routes.UNPAID);
};

exports.excelFile = function (req, res) {
    wufoo.makeQuery(0, util.query.all, [], function (entries) {
        entries = JSON.parse(entries);
        let workbook = xlsx.utils.book_new();
        let groups = {};
        db.selectAll("groupData", function (err, rows) {
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
};

function clean(person) {
    let fields = util.con.getAccessibleFields(true);
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
        db.selectAll("groupData", function (err, rows) {
            let groupNumbers = util.getGroupNumbers(rows);
            view.renderPaginated(result, util.views.FILTER, request, JSON.stringify(entries), groupNumbers, route, nextPageNum, prevPageNum);
        });
    });
}

function getPageNum(request) {
    let pageNum = request.query.nextPage ? parseInt(request.query.nextPage) : 0;
    return request.query.prevPage ? parseInt(request.query.prevPage) : pageNum;
}