const xlsx = require("xlsx");
const fs = require("fs");
const util = require("../controllerUtil");
const db = util.db;
const wufoo = util.wufoo;

exports.all = async function (nextPage, prevPage) {
    return await getRequest("all registration", nextPage, prevPage, util.query.all, util.routes.FILTER);
};

exports.age = async function (nextPage, prevPage) {
    return await getRequest("age registration", nextPage, prevPage, util.query.age, util.routes.AGE);
};

exports.food = async function (nextPage, prevPage) {
    return await getRequest("food registration", nextPage, prevPage, util.query.foodRestrictions, util.routes.FOOD_RESTRICTIONS);
};

exports.primer = async function (nextPage, prevPage) {
    return await getRequest("primer registration", nextPage, prevPage, util.query.wantPrimer, util.routes.PRIMER);
};

exports.medical = async function (nextPage, prevPage) {
    return await getRequest("medical registration", nextPage, prevPage, util.query.medicalConcerns, util.routes.MEDICAL);
};

exports.pronouns = async function (nextPage, prevPage) {
    return await getRequest("pronouns registration", nextPage, prevPage, util.query.pronoun, util.routes.PRONOUNS);
};

exports.accessibility = async function (nextPage, prevPage) {
    return await getRequest("accessibility registration", nextPage, prevPage, util.query.accessibilityConcerns, util.routes.ACCESSIBILITY);
};

exports.payPerson = async function (nextPage, prevPage) {
    return await getRequest("pay person registration", nextPage, prevPage, util.query.payInPerson, util.routes.PAY_PERSON);
};

exports.payMail = async function (nextPage, prevPage) {
    return await getRequest("pay mail registration", nextPage, prevPage, util.query.payByMail, util.routes.PAY_MAIL);
};

exports.payOnline = async function (nextPage, prevPage) {
    return await getRequest("pay online registration", nextPage, prevPage, util.query.payOnline, util.routes.PAY_ONLINE);
};

exports.unpaid = async function (nextPage, prevPage) {
    return await getRequest("unpaid registration", nextPage, prevPage, util.query.unpaid, util.routes.UNPAID);
};

exports.excelFile = async function (response) {
    return await util.execute("get", "excel file", null, "", async function () {
        let entries = await wufoo.makeQuery(0, util.query.all, []);
        entries = JSON.parse(entries);
        let workbook = xlsx.utils.book_new();
        let groups = {};
        let rows = await db.selectAll("groupData");
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
        let filename = "Exported-Group-Data.xlsx";
        let filePath = __dirname + "/../../server/" + filename;
        xlsx.writeFile(workbook, filename);
        return new Promise(function (resolve, reject) {
            try {
                response.download(filePath, function () {
                    fs.unlinkSync(filePath);
                    resolve();
                });
            } catch (e) {
                reject(e);
            }
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

async function getRequest(action, nextPage, prevPage, query, actionPath) {
    return await util.execute("get", action, true, util.views.FILTER, async function () {
        let pageNum = getPageNum(nextPage, prevPage);
        let [body, nextPageNum, prevPageNum] = await wufoo.makePaginatedQuery(pageNum, query);
        let entries = util.pruneDuplicateFrosh(JSON.parse(body));
        let rows = await db.selectAll("groupData");
        let groupNumbers = util.getGroupNumbers(rows);
        return {
            actionPath: actionPath, nextPage: nextPageNum, prevPage: prevPageNum, groupNumbers: groupNumbers,
            data: {entries: entries}
        };
    });
}

function getPageNum(nextPage, prevPage) {
    let pageNum = nextPage ? parseInt(nextPage) : 0;
    return prevPage ? parseInt(prevPage) : pageNum;
}