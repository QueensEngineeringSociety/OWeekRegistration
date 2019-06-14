const request = require("request");
const PropertiesReader = require('properties-reader');
const con = require("./wufooConstants.js");
const query = require("./wufooQueryBuilder.js");

const properties = PropertiesReader(__dirname + "/../../config/wufoo_properties.ini");

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

exports.makeQuery = function (pageStart, queryString, allEntries, callback) {
    if (allEntries === undefined || allEntries === null) {
        allEntries = [];
    }
    request({
        uri: properties.get('uri') + queryString + "&pageSize=100&pageStart=" + pageStart,
        method: properties.get('method'),
        auth: {
            'username': properties.get('username'),
            'password': properties.get('password'),
            'sendImmediately': false
        }
    }, function (error, response, body) {
        let entries = JSON.parse(body);
        if (entries["Entries"].length) {
            allEntries = allEntries.concat(entries["Entries"]);
            let newPageStart = pageStart + 100;
            exports.makeQuery(newPageStart, queryString, allEntries, callback);
        } else {
            getComments().then(function (allComments) {
                for (let i = 0; i < allEntries.length; ++i) {
                    (allEntries[i])["comment"] = getEntryComment((allEntries[i])["EntryId"], allComments);
                }
                callback(JSON.stringify(allEntries)); //make it a string so ejs files don't need to be changed (they expect json string)
            }).catch(function (err) {
                console.log("Error getting comments: " + err);
                callback(JSON.stringify(allEntries));
            });
        }
    });
};

exports.makePaginatedQuery = function (pageNum, queryString, callback) {
    let pageStart = pageNum * PAGE_SIZE;
    request({
        uri: properties.get('uri') + queryString + "&pageSize=" + PAGE_SIZE + "&pageStart=" + pageStart,
        method: properties.get('method'),
        auth: {
            'username': properties.get('username'),
            'password': properties.get('password'),
            'sendImmediately': false
        }
    }, function (error, response, body) {
        let entries = (JSON.parse(body))["Entries"];
        getComments().then(function (allComments) {
            for (let i = 0; i < entries.length; ++i) {
                (entries[i])["comment"] = getEntryComment((entries[i])["EntryId"], allComments);
            }
            let nextPageNum = entries.length < 1 ? -1 : pageNum + 1;
            let prevPageNum = pageNum > 0 ? pageNum - 1 : -1;
            callback(JSON.stringify(entries), nextPageNum, prevPageNum); //make it a string so ejs files don't need to be changed (they expect json string)
        }).catch(function (err) {
            console.log("Error getting comments: " + err);
        });
    });
};

exports.getEntriesById = function (ids, callback) {
    request({
        uri: properties.get('uri') + query.buildEntryIDsQuery(ids),
        method: properties.get('method'),
        auth: {
            'username': properties.get('username'),
            'password': properties.get('password'),
            'sendImmediately': false
        }
    }, function (error, response, body) {
        let entries = (JSON.parse(body))["Entries"];
        getComments().then(function (allComments) {
            for (let i = 0; i < entries.length; ++i) {
                (entries[i])["comment"] = getEntryComment((entries[i])["EntryId"], allComments);
            }
            callback(JSON.stringify(entries)); //make it a string so ejs files don't need to be changed (they expect json string)
        }).catch(function (err) {
            console.log("Error getting comments: " + err);
        });
    });
};

function getComments() {
    return new Promise(function (res) {
        request({
            uri: properties.get('comments_uri'),
            method: properties.get('method'),
            auth: {
                'username': properties.get('username'),
                'password': properties.get('password'),
                'sendImmediately': false
            }
        }, function (error, response, body) {
            return res(body);
        });
    });
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