var request = require("request");
var PropertiesReader = require('properties-reader');
var con = require("./wufooConstants.js");
var query = require("./wufooQueryBuilder.js");

var properties = PropertiesReader(__dirname + "/../../config/wufoo_properties.ini");

var fields = con.allFields;

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

exports.makeQuery = function (pageStart, queryString, callback, allEntries) {
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
        var entries = JSON.parse(body);
        if (entries["Entries"].length) {
            allEntries = allEntries.concat(entries["Entries"]);
            var newPageStart = pageStart + 100;
            exports.makeQuery(newPageStart, queryString, callback, allEntries);
        } else {
            getComments().then(function (allComments) {
                for (var i = 0; i < allEntries.length; ++i) {
                    (allEntries[i])["comment"] = getEntryComment((allEntries[i])["EntryId"], allComments);
                }
                callback(JSON.stringify(allEntries)); //make it a string so ejs files don't need to be changed (they expect json string)
            }).catch(function (err) {
                console.log("Error getting comments: " + err);
            });
        }
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
    var comments = (JSON.parse(allComments))['Comments'];
    for (var i = 0; i < comments.length; ++i) {
        if ((comments[i])["CommentId"] == entryId) { //entry ID comes in as string, json value is int
            return (comments[i])["Text"];
        }
    }
    return "";
}