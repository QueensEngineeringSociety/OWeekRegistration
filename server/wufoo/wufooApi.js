var request = require("request");
var PropertiesReader = require('properties-reader');
var con = require("./wufooConstants.js");
var query = require("./wufooQueryBuilder.js");

var properties = PropertiesReader(__dirname + "/../../config/wufoo_properties.ini");

var fields = con.allFields;
var PAGE_SIZE = 3;

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

exports.makeQuery = function (pageNum, queryString, callback) {
    var pageStart = 1 + pageNum * PAGE_SIZE;
    request({
        uri: properties.get('uri') + queryString + "&pageSize=" + PAGE_SIZE + "&pageStart=" + pageStart,
        method: properties.get('method'),
        auth: {
            'username': properties.get('username'),
            'password': properties.get('password'),
            'sendImmediately': false
        }
    }, function (error, response, body) {
        var entries = (JSON.parse(body))["Entries"];
        console.log(entries);
        getComments().then(function (allComments) {
            for (var i = 0; i < entries.length; ++i) {
                (entries[i])["comment"] = getEntryComment((entries[i])["EntryId"], allComments);
            }
            var nextPageNum = entries.length < 1 ? -1 : pageNum + 1;
            var prevPageNum = pageNum > 0 ? pageNum - 1 : -1;
            callback(JSON.stringify(entries), nextPageNum, prevPageNum); //make it a string so ejs files don't need to be changed (they expect json string)
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
    var comments = (JSON.parse(allComments))['Comments'];
    for (var i = 0; i < comments.length; ++i) {
        if ((comments[i])["EntryId"] == entryId) { //i ID comes in as string, json value is int
            return (comments[i])["Text"];
        }
    }
    return "";
}