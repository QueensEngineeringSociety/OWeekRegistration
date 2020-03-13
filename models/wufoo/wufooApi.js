const request = require("request");
const PropertiesReader = require('properties-reader');
const con = require("./wufooConstants.js");
const query = require("./wufooQueryBuilder.js");

const properties = PropertiesReader(__dirname + "/../../config/wufoo_properties.cfg");

const fields = con.allFields;
const PAGE_SIZE = 40;

exports.queries = {
    all: query.buildQuery(),
    foodRestrictions: query.buildIssueQuery(fields.foodRestrictions),
    medicalConcerns: query.buildIssueQuery(fields.medicalConcerns),
    accessibilityConcerns: query.buildIssueQuery(fields.accessibilityConcerns),
    wantPrimer: query.buildQuery([query.buildEquals(fields.primer, "yes")]),
    payOnline: query.buildQuery([query.buildEquals(fields.payOnline, "yes")]),
    payInPerson: query.buildQuery([query.buildEquals(fields.payPerson, "yes")]),
    payByMail: query.buildQuery([query.buildEquals(fields.payMail, "yes")]),
    age: query.buildQuery([query.buildEquals(fields.under18, "yes")]),
    unpaid: query.buildQuery([query.buildNotEqual(fields.payStatus, "paid")]),
    pronoun: query.buildPronouns()
};

exports.makeQuery = async function (pageStart, queryString, allEntries) {
    if (allEntries === undefined || allEntries === null) {
        allEntries = [];
    }
    let body = await callApi(properties.get('uri') + queryString + "&pageSize=100&pageStart=" + pageStart);
    let entries = JSON.parse(body);
    if (entries["Entries"].length) {
        allEntries = allEntries.concat(entries["Entries"]);
        let newPageStart = pageStart + 100;
        return await exports.makeQuery(newPageStart, queryString, allEntries);
    } else {
        try {
            let allComments = await getComments();
            for (let i = 0; i < allEntries.length; ++i) {
                (allEntries[i])["comment"] = getEntryComment((allEntries[i])["EntryId"], allComments);
            }
            return JSON.stringify(allEntries);
        } catch (e) {
            console.log("Error getting comments: " + e); //TODO proper log
            return JSON.stringify(allEntries);
        }
    }
};

exports.makePaginatedQuery = async function (pageNum, queryString) {
    let pageStart = pageNum * PAGE_SIZE;
    let body = await callApi(properties.get('uri') + queryString + "&pageSize=" + PAGE_SIZE + "&pageStart=" + pageStart);
    let entries = (JSON.parse(body))["Entries"];
    let allComments = await getComments();
    for (let i = 0; i < entries.length; ++i) {
        (entries[i])["comment"] = getEntryComment((entries[i])["EntryId"], allComments);
    }
    let nextPageNum = entries.length < 1 ? -1 : pageNum + 1;
    let prevPageNum = pageNum > 0 ? pageNum - 1 : -1;
    return [JSON.stringify(entries), nextPageNum, prevPageNum];
};

exports.getEntriesById = async function (ids) {
    let body = await callApi(properties.get('uri') + query.buildEntryIDsQuery(ids));
    let entries = (JSON.parse(body))["Entries"];
    let allComments = await getComments();
    for (let i = 0; i < entries.length; ++i) {
        (entries[i])["comment"] = getEntryComment((entries[i])["EntryId"], allComments);
    }
    return JSON.stringify(entries);
};

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
        if ((comments[i])["EntryId"] == entryId) { //i ID comes in as string, json value is int
            return (comments[i])["Text"];
        }
    }
    return "";
}