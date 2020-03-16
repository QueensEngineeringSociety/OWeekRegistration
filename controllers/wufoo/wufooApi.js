const request = require("request");
const PropertiesReader = require('properties-reader');
const build = require("./wufooQueryBuilder.js");
const logger = require("../../server/logger")(__filename);
const properties = PropertiesReader(__dirname + "/../../config/wufoo_properties.cfg");

exports.all = async function (pageNum, doPaginated) {
    return await execute(pageNum, build.all, doPaginated);
};

exports.foodRestrictions = async function (pageNum, doPaginated) {
    return await execute(pageNum, build.foodRestrictions, doPaginated);
};

exports.medicalConcerns = async function (pageNum, doPaginated) {
    return await execute(pageNum, build.medicalConcerns, doPaginated);
};

exports.accessibilityConcerns = async function (pageNum, doPaginated) {
    return await execute(pageNum, build.accessibilityConcerns, doPaginated);
};

exports.wantPrimer = async function (pageNum, doPaginated) {
    return await execute(pageNum, build.wantPrimer, doPaginated);
};

exports.payOnline = async function (pageNum, doPaginated) {
    return await execute(pageNum, build.payOnline, doPaginated);
};

exports.payInPerson = async function (pageNum, doPaginated) {
    return await execute(pageNum, build.payInPerson, doPaginated);
};

exports.payByMail = async function (pageNum, doPaginated) {
    return await execute(pageNum, build.payByMail, doPaginated);
};

exports.age = async function (pageNum, doPaginated) {
    return await execute(pageNum, build.age, doPaginated);
};

exports.unpaid = async function (pageNum, doPaginated) {
    return await execute(pageNum, build.unpaid, doPaginated);
};

exports.pronoun = async function (pageNum, doPaginated) {
    return await execute(pageNum, build.pronoun, doPaginated);
};

exports.netid = async function (netid, doPaginated) {
    if (doPaginated) {
        return await makePaginatedQuery(0, build.netid(0, netid));
    } else {
        return await makeQuery(0, build.netid(0, netid));
    }
};

exports.entryId = async function (ids, doPaginated) {
    if (doPaginated) {
        return await makePaginatedQuery(0, build.entryID(0, ids));
    } else {
        return await makeQuery(0, build.entryID(0, ids));
    }
};

exports.search = async function (field, operator, value, doPaginated) {
    if (doPaginated) {
        return await makePaginatedQuery(0, build.search(field, operator, value));
    } else {
        return await makeQuery(0, build.search(field, operator, value));
    }
};

async function execute(pageNum, queryBuildFunction, doPaginated) {
    if (!pageNum) {
        pageNum = 0;
    }
    let pageStart = pageNum * build.PAGE_SIZE;
    if (doPaginated) {
        return await makePaginatedQuery(pageNum, queryBuildFunction(pageStart));
    } else {
        return await makeQuery(pageStart, queryBuildFunction(pageStart));
    }
}

async function makeQuery(pageStart, queryString, allEntries) {
    if (!allEntries) {
        allEntries = [];
    }
    let body = await callApi(properties.get('uri') + queryString + build.makePaginated(pageStart));
    let entries = JSON.parse(body);
    if (entries["Entries"].length) {
        allEntries = allEntries.concat(entries["Entries"]);
        let newPageStart = pageStart + build.PAGE_SIZE;
        return await makeQuery(newPageStart, queryString, allEntries);
    } else {
        try {
            let allComments = await getComments();
            for (let i = 0; i < allEntries.length; ++i) {
                (allEntries[i])["comment"] = getEntryComment((allEntries[i])["EntryId"], allComments);
            }
            return allEntries;
        } catch (e) {
            logger.error(e);
            return allEntries;
        }
    }
}

async function makePaginatedQuery(pageNum, queryString) {
    let body = await callApi(properties.get('uri') + queryString + build.makePaginated(pageNum * build.PAGE_SIZE));
    let entries = (JSON.parse(body))["Entries"];
    let allComments = await getComments();
    for (let i = 0; i < entries.length; ++i) {
        (entries[i])["comment"] = getEntryComment((entries[i])["EntryId"], allComments);
    }
    let nextPageNum = entries.length < 1 ? -1 : pageNum + 1;
    let prevPageNum = pageNum > 0 ? pageNum - 1 : -1;
    return [entries, nextPageNum, prevPageNum];
}

function callApi(uri) {
    return new Promise(((resolve, reject) => {
        request({
            uri: uri,
            method: properties.get('method'),
            auth: {
                'username': properties.get('username'),
                'password': properties.get('password'),
                'sendImmediately': false
            }
        }, function (error, response, body) {
            if (error) {
                reject(error);
            } else {
                resolve(body); //TODO check if can run json parse here - comments may not allow?
            }
        });
    }));
}

async function getComments() {
    return await callApi(properties.get("comments_uri"));
}

function getEntryComment(entryId, allComments) {
    let comments = (JSON.parse(allComments))['Comments'];
    for (let i = 0; i < comments.length; ++i) {
        if ((comments[i])["EntryId"] === parseInt(entryId)) {
            return (comments[i])["Text"];
        }
    }
    return "";
}