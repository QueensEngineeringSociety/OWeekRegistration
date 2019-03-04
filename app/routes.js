const wufoo = require("../server/wufoo/wufooApi.js");
const builder = require("../server/wufoo/wufooQueryBuilder");
const dbConn = require("../config/database.js");
const con = require("../server/wufoo/wufooConstants");
const User = require("./models/user");
const query = wufoo.queries;

const ROUTE_HOME="/";
const ROUTE_LOGIN="/login";
const ROUTE_USER_MANAGEMENT="/usermanagement";
const ROUTE_SIGN_UP="/signup";
const ROUTE_USER_EDIT="/useredit";
const ROUTE_USER_DELETE="/userdelete";
const ROUTE_FILTER="/filter";
const ROUTE_AGE="/age";
const ROUTE_FOOD_RESTRICTIONS="/food_restrictions";
const ROUTE_PRIMER="/primer";
const ROUTE_MEDICAL="/medical";
const ROUTE_PRONOUNS="/pronouns";
const ROUTE_ACCESSIBILITY="/accessibility";
const ROUTE_PAY_PERSON="/payPerson";
const ROUTE_PAY_ONLINE="/payOnline";
const ROUTE_PAY_MAIL="/payMail";
const ROUTE_UNPAID="/unpaid";
const ROUTE_SEARCH="/search";
const ROUTE_NET_ID="/netid";
const ROUTE_ALL_GROUPS="/allgroups";
const ROUTE_ONE_GROUP="/onegroup";
const ROUTE_UPDATE_MAXNUM="/updatemaxnum";
const ROUTE_ASSIGN="/assign";
const ROUTE_CLEAR_GROUPS="/cleargroups";
const ROUTE_ERROR="/error";
const ROUTE_LOGOUT="/logout";

const strongPassRegex = RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\\$%\\^&\\*])(?=.{8,})");
let maxNumInGroup = 30;

module.exports = function (app, passport) {
    app.get(ROUTE_HOME, function (req, res) {
            if (req.user) {
                res.redirect(ROUTE_FILTER);
            } else {
                res.render('index.ejs');
            }
        }
    );

    app.get(ROUTE_LOGIN, function (req, res) {
        if (req.user) {
            res.redirect(ROUTE_FILTER);
        } else {
            res.render('login.ejs', {message: req.flash('loginMessage')});
        }
    });

    app.post(ROUTE_LOGIN, passport.authenticate('local-login', {
        successRedirect: ROUTE_FILTER,
        failureRedirect: ROUTE_LOGIN,
        failureFlash: true
    }));

    app.get(ROUTE_USER_MANAGEMENT, requireAdmin, function (req, res) {
        res.render('users.ejs', {message: req.flash('signupMessage')});
    });

    app.post(ROUTE_SIGN_UP, requireAdmin, function (req, res) {
        dbConn.query("SELECT * FROM users WHERE email = ?", [req.body.email], function (err, rows) {
            if (err) {
                console.log("ERROR: " + err);
            }
            if (rows.length) {
                res.render('error.ejs', {errorMessage: "That email already exists"});
            } else if (!strongPassRegex.test(req.body.password)) {
                res.render('error.ejs', {errorMessage: "That password doesn't match the requirements: 1 lowercase, uppercase, number, special character and at least 8 characters long"});
            } else {
                // if there is no user with that username, then create that user
                let newUser = new User(req.body.first_name, req.body.last_name, req.body.email, req.body.password, req.body.is_admin === "admin");
                let insertQuery = "INSERT INTO users (first_name,last_name,email,password,created,is_admin) values (?,?,?,?,?,?);";
                dbConn.query(insertQuery, [newUser.first_name, newUser.last_name, newUser.email, newUser.password, newUser.created, newUser.is_admin],
                    function (err, rows) {
                        if (err)
                            console.log("ERROR: " + err);
                        newUser.id = rows.insertId;
                        res.render('users.ejs', {message: req.flash('signupMessage')});
                    });
            }
        });
    });

    app.post(ROUTE_USER_EDIT, requireAdmin, function (req, res) {
        dbConn.query("SELECT * FROM users WHERE email = ?", [req.body.email], function (err, rows) {
            if (err) {
                console.log("ERROR: " + err);
            }
            if (!rows.length) {
                res.render('error.ejs', {errorMessage: "That email doesn't exist"});
            } else if (!strongPassRegex.test(req.body.password)) {
                res.render('error.ejs', {errorMessage: "That password doesn't match the requirements: 1 lowercase, uppercase, number, special character and at least 8 characters long"});
            } else {
                let replacementUser = new User(req.body.first_name, req.body.last_name, req.body.email, req.body.password, req.body.is_admin === "admin");
                let query = "UPDATE users SET first_name=?, last_name=?,email=?,password=?,is_admin=? WHERE id=?;";
                dbConn.query(query, [replacementUser.first_name, replacementUser.last_name, replacementUser.email, replacementUser.password, replacementUser.is_admin, rows[0].id],
                    function (err, rows) {
                        if (err)
                            console.log("ERROR: " + err);
                        replacementUser.id = rows.insertId;
                        res.render('users.ejs', {message: req.flash('signupMessage')});
                    });
            }
        });
    });

    app.get(ROUTE_USER_DELETE, requireAdmin, function (req, res) {
        dbConn.query("SELECT * FROM users", [], function (err, rows) {
            if (err) {
                console.log("ERROR: " + err);
            }
            if (!rows.length) {
                res.render('error.ejs', {errorMessage: "That email doesn't exist"});
            } else {
                res.render('deleteusers.ejs', {
                    message: req.flash('signupMessage'),
                    users: rows
                });
            }
        });
    });

    app.post(ROUTE_USER_DELETE, requireAdmin, function (req, res) {
        let queryString = "";
        if (typeof req.body.users.length === "object") {
            queryString = "DELETE FROM users WHERE email IN('" + req.body.users.join("','") + "')";
        } else {
            //just one user, no join
            queryString = "DELETE FROM users WHERE email IN('" + req.body.users + "')";
        }
        dbConn.query(queryString, [], function (topErr, topRows) {
            dbConn.query("SELECT * FROM users", [], function (err, rows) {
                if (err) {
                    console.log("ERROR: " + err);
                }
                if (!rows.length) {
                    res.render('error.ejs', {errorMessage: "There are no users!"});
                } else {
                    res.render('deleteusers.ejs', {
                        message: req.flash('signupMessage'),
                        users: rows
                    });
                }
            });
        });
    });

    app.get(ROUTE_FILTER, isLoggedIn, function (req, res) {
        let accessFields = con.generalFields;
        let admin = isAdmin(req);
        if (admin) {
            accessFields = con.allFields;
        }
        let pageNum = req.query.nextPage ? parseInt(req.query.nextPage) : 0;
        pageNum = req.query.prevPage ? parseInt(req.query.prevPage) : pageNum;
        wufoo.makePaginatedQuery(pageNum, query.all, function (body, nextPageNum, prevPageNum) {
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
                    actionPath: "/filter"
                });
            });
        });
    });

    app.get(ROUTE_AGE, isLoggedIn, function (req, res) {
        let accessFields = con.generalFields;
        let admin = isAdmin(req);
        if (admin) {
            accessFields = con.allFields;
        }
        let pageNum = req.query.nextPage ? parseInt(req.query.nextPage) : 0;
        pageNum = req.query.prevPage ? parseInt(req.query.prevPage) : pageNum;
        wufoo.makePaginatedQuery(pageNum, query.age, function (body, nextPageNum, prevPageNum) {
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
                    actionPath: "/age"
                });
            });
        });
    });

    app.get(ROUTE_FOOD_RESTRICTIONS, requireAdmin, function (req, res) {
        let pageNum = req.query.nextPage ? parseInt(req.query.nextPage) : 0;
        pageNum = req.query.prevPage ? parseInt(req.query.prevPage) : pageNum;
        wufoo.makePaginatedQuery(pageNum, query.foodRestrictions, function (body, nextPageNum, prevPageNum) {
            dbConn.query("SELECT * FROM groupData", [], function (err, rows) {
                let groupNumbers = [];
                for (let i in rows) {
                    groupNumbers[rows[i].wufooEntryId] = rows[i].groupNum; //i ID is unique
                }
                res.render('filter.ejs', {
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
    });

    app.get(ROUTE_PRIMER, requireAdmin, function (req, res) {
        let pageNum = req.query.nextPage ? parseInt(req.query.nextPage) : 0;
        pageNum = req.query.prevPage ? parseInt(req.query.prevPage) : pageNum;
        wufoo.makePaginatedQuery(pageNum, query.wantPrimer, function (body, nextPageNum, prevPageNum) {
            dbConn.query("SELECT * FROM groupData", [], function (err, rows) {
                let groupNumbers = [];
                for (let i in rows) {
                    groupNumbers[rows[i].wufooEntryId] = rows[i].groupNum; //i ID is unique
                }
                res.render('filter.ejs', {
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
    });

    app.get(ROUTE_MEDICAL, requireAdmin, function (req, res) {
        let pageNum = req.query.nextPage ? parseInt(req.query.nextPage) : 0;
        pageNum = req.query.prevPage ? parseInt(req.query.prevPage) : pageNum;
        wufoo.makePaginatedQuery(pageNum, query.medicalConcerns, function (body, nextPageNum, prevPageNum) {
            dbConn.query("SELECT * FROM groupData", [], function (err, rows) {
                let groupNumbers = [];
                for (let i in rows) {
                    groupNumbers[rows[i].wufooEntryId] = rows[i].groupNum; //i ID is unique
                }
                res.render('filter.ejs', {
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
    });

    app.get(ROUTE_PRONOUNS, requireAdmin, function (req, res) {
        let pageNum = req.query.nextPage ? parseInt(req.query.nextPage) : 0;
        pageNum = req.query.prevPage ? parseInt(req.query.prevPage) : pageNum;
        wufoo.makePaginatedQuery(pageNum, query.pronoun, function (body, nextPageNum, prevPageNum) {
            dbConn.query("SELECT * FROM groupData", [], function (err, rows) {
                let groupNumbers = [];
                for (let i in rows) {
                    groupNumbers[rows[i].wufooEntryId] = rows[i].groupNum; //i ID is unique
                }
                res.render('filter.ejs', {
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
    });

    app.get(ROUTE_ACCESSIBILITY, requireAdmin, function (req, res) {
        let pageNum = req.query.nextPage ? parseInt(req.query.nextPage) : 0;
        pageNum = req.query.prevPage ? parseInt(req.query.prevPage) : pageNum;
        wufoo.makePaginatedQuery(pageNum, query.accessibilityConcerns, function (body, nextPageNum, prevPageNum) {
            dbConn.query("SELECT * FROM groupData", [], function (err, rows) {
                let groupNumbers = [];
                for (let i in rows) {
                    groupNumbers[rows[i].wufooEntryId] = rows[i].groupNum; //i ID is unique
                }
                res.render('filter.ejs', {
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
    });

    app.get(ROUTE_PAY_PERSON, isLoggedIn, function (req, res) {
        let accessFields = con.generalFields;
        let admin = isAdmin(req);
        if (admin) {
            accessFields = con.allFields;
        }
        let pageNum = req.query.nextPage ? parseInt(req.query.nextPage) : 0;
        pageNum = req.query.prevPage ? parseInt(req.query.prevPage) : pageNum;
        wufoo.makePaginatedQuery(pageNum, query.payInPerson, function (body, nextPageNum, prevPageNum) {
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
                    actionPath: "/payPerson"
                });
            });
        });
    });

    app.get(ROUTE_PAY_MAIL, isLoggedIn, function (req, res) {
        let accessFields = con.generalFields;
        let admin = isAdmin(req);
        if (admin) {
            accessFields = con.allFields;
        }
        let pageNum = req.query.nextPage ? parseInt(req.query.nextPage) : 0;
        pageNum = req.query.prevPage ? parseInt(req.query.prevPage) : pageNum;
        wufoo.makePaginatedQuery(pageNum, query.payByMail, function (body, nextPageNum, prevPageNum) {
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
                    actionPath: "/payMail"
                });
            });
        });
    });

    app.get(ROUTE_PAY_ONLINE, isLoggedIn, function (req, res) {
        let accessFields = con.generalFields;
        let admin = isAdmin(req);
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
    });

    app.get(ROUTE_UNPAID, isLoggedIn, function (req, res) {
        let accessFields = con.generalFields;
        let admin = isAdmin(req);
        if (admin) {
            accessFields = con.allFields;
        }
        let pageNum = req.query.nextPage ? parseInt(req.query.nextPage) : 0;
        pageNum = req.query.prevPage ? parseInt(req.query.prevPage) : pageNum;
        wufoo.makePaginatedQuery(pageNum, query.unpaid, function (body, nextPageNum, prevPageNum) {
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
                    actionPath: "/unpaid"
                });
            });
        });
    });

    app.get(ROUTE_SEARCH, isLoggedIn, function (req, res) {
        if (req.query['field'] && req.query['operator'] && req.query['value']) {
            let accessFields = con.generalFields;
            let admin = isAdmin(req);
            if (admin) {
                accessFields = con.allFields;
            }
            wufoo.makeQuery(builder.customQuery(req.query['field'], req.query['operator'], req.query['value']), function (body) {
                dbConn.query("SELECT * FROM groupData", [], function (err, rows) {
                    let groupNumbers = [];
                    for (let i in rows) {
                        groupNumbers[rows[i].wufooEntryId] = rows[i].groupNum; //i ID is unique
                    }
                    res.render('search.ejs', {
                        wufoo: body,
                        groupNumbers: groupNumbers,
                        operators: con.operators,
                        fields: accessFields,
                        headings: con.headings,
                        isAdmin: admin,
                        actionPath: "/search"
                    });
                });
            });
        }
    });

    app.get(ROUTE_NET_ID, isLoggedIn, function (req, res) {
        if (req.query['netid_search']) {
            let accessFields = con.generalFields;
            let admin = isAdmin(req);
            if (admin) {
                accessFields = con.allFields;
            }
            wufoo.makeQuery(builder.buildNetidQuery(req.query['netid_search']), function (body) {
                dbConn.query("SELECT * FROM groupData", [], function (err, rows) {
                    let groupNumbers = [];
                    for (let i in rows) {
                        groupNumbers[rows[i].wufooEntryId] = rows[i].groupNum; //i ID is unique
                    }
                    res.render('search.ejs', {
                        wufoo: body,
                        groupNumbers: groupNumbers,
                        operators: con.operators,
                        fields: accessFields,
                        headings: con.headings,
                        isAdmin: admin,
                        actionPath: "/netid"
                    });
                });
            });
        }
    });

    app.get(ROUTE_ALL_GROUPS, requireAdmin, function (req, res) {
        dbConn.query("SELECT maxNumInGroup FROM groupMetaData", function (err, rows) {
            if (err) {
                console.log("ERROR: " + err);
                res.render('error.ejs', {errorMessage: "Cannot get number of groups."});
            } else {
                maxNumInGroup = rows[0].maxNumInGroup;
                dbConn.query("SELECT * FROM groups", [], function (err, rows) {
                    if (err) {
                        console.log("ERROR: " + err);
                        res.render('error.ejs', {errorMessage: "No groups"});
                    } else {
                        res.render('groups.ejs', {
                            groups: rows,
                            groupMax: maxNumInGroup
                        });
                    }
                });
            }
        });
    });

    app.post(ROUTE_ONE_GROUP, requireAdmin, function (req, res) {
        dbConn.query("SELECT * FROM groupData WHERE groupNum = ?", [req.body.groupNumber], function (err, rows) {
            if (err) {
                console.log("ERROR: " + err);
            }
            if (!rows.length) {
                res.render('error.ejs', {errorMessage: "No groups"});
            } else {
                let entryIds = [];
                for (let i = 0; i < rows.length; i++) {
                    entryIds[i] = rows[i].wufooEntryId;
                }
                wufoo.getEntriesById(entryIds, function (body) {
                    body = JSON.parse(body);
                    dbConn.query("SELECT * FROM groups WHERE groupNumber = ?", [req.body.groupNumber], function (err, rows) {
                        if (err) {
                            console.log("ERROR: " + err);
                        }
                        if (!rows.length) {
                            res.render('error.ejs', {errorMessage: "No groups"});
                        } else {
                            res.render('group.ejs', {
                                isAdmin: true,
                                groupData: rows[0], //only one group with that group number
                                peopleInGroup: body,
                                fields: con.groupFields,
                                headings: con.headings
                            });
                        }
                    });
                });
            }
        });
    });

    app.post(ROUTE_UPDATE_MAXNUM, requireAdmin, function (req, res) {
        if (req.body.updatemax) {
            dbConn.query("UPDATE groupMetaData SET maxNumInGroup=?", [req.body.updatemax], function (err) {
                if (err) {
                    console.log("ERROR: " + err);
                    res.render("error.ejs", {errorMessage: "Couldn't update maximum group number."});
                } else {
                    res.redirect("/allgroups");
                }
            });
        } else {
            console.log("ERROR: No given maximum");
            res.render("error.ejs", {errorMessage: "Not given a maximum group number."});
        }
    });

    app.post(ROUTE_ASSIGN, requireAdmin, function (req, res) {
        dbConn.query("SELECT * FROM groupMetaData", function (err, rows) {
                if (err) {
                    console.log("ERROR: " + err);
                }
                if (!rows.length) {
                    res.render('error.ejs', {errorMessage: "No metadata could be used to assign groups."});
                } else {
                    let manGroupNum = rows[0].manGroupNum;
                    let womanGroupNum = rows[0].womanGroupNum;
                    //get frosh already in a group
                    dbConn.query("SELECT * FROM groupData", function (err, rows) {
                        let assignedFrosh = [];
                        if (err) {
                            console.log("ERROR: " + err);
                        }
                        if (rows.length) {
                            for (let i in rows) {
                                assignedFrosh.push(rows[i].wufooEntryId);
                            }
                        }
                        wufoo.makePaginatedQuery(0, query.all, function (body) {
                            //show updated groups
                            body = JSON.parse(body);
                            let insertions = [];
                            for (let i in body) {
                                if (!inArr(assignedFrosh, body[i].EntryId)) {
                                    insertions.push({
                                        "id": body[i].EntryId,
                                        "genderIsMan": isMan((body[i])[con.allFields.pronouns])
                                    });
                                }
                            }
                            if (insertions.length) {
                                assign(manGroupNum, womanGroupNum, insertions).then(function () {
                                    res.redirect("back"); //refresh
                                }).catch(function (errMessage) {
                                    res.render('error.ejs', {errorMessage: errMessage});
                                });
                            } else {
                                res.redirect("back");
                            }
                        });
                    });
                }
            }
        );
    });

    app.post(ROUTE_CLEAR_GROUPS, requireAdmin, function (req, res) {
        dbConn.query("UPDATE groupMetaData set manGroupNum=0, womanGroupNum=0", function (err) {
            if (err) {
                console.log("ERROR: " + err);
                res.render('error.ejs', {errorMessage: "Could not delete any group data"});
            } else {
                dbConn.query("DELETE FROM groupData", function (err) {
                    if (err) {
                        console.log("ERROR: " + err);
                        res.render('error.ejs', {errorMessage: "Cleared metadata and groups, but couldn't delete group data. Contact DoIT."});
                    } else {
                        dbConn.query("DELETE FROM groups", function (err) {
                            if (err) {
                                console.log("ERROR: " + err);
                                res.render('error.ejs', {errorMessage: "Cleared metadata, but couldn't delete groups. Contact DoIT."});
                            } else {
                                res.redirect("/allgroups");
                            }
                        });
                    }
                });
            }
        })
    });

    app.get(ROUTE_ERROR, isLoggedIn, function (req, res) {
        res.render('error.ejs', {errorMessage: "You don't have the privileges to see this."});
    });

    app.get(ROUTE_LOGOUT, function (req, res) {
        req.logout();
        res.redirect('/');
    });
};

function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    } else {
        res.redirect(ROUTE_HOME);
    }
}

function requireAdmin(req, res, next) {
    if (!req.isAuthenticated()) {
        res.redirect(ROUTE_HOME);
    } else if (req.user && req.user.is_admin) {
        return next();
    } else {
        res.redirect(ROUTE_ERROR);
    }
}

function isAdmin(req) {
    return req.user.is_admin;
}

function incGroupNum(num) {
    return (num + 1) % maxNumInGroup;
}

function isMan(text) {
    //if doesn't use she or her as pronoun, assume man
    text = text.toLowerCase();
    return text.indexOf("she") === -1 && text.indexOf("her") === -1;
}

function insertFroshToGroup(insertIdx, insertions) {
    return new Promise(function (res, rej) {
        if (insertIdx < insertions.length) {
            let id = insertions[insertIdx].wufooEntryId;
            let num = insertions[insertIdx].groupNum;
            dbConn.query("insert groupData values(?,?)", [id, num], function (err) {
                if (err) {
                    console.log("ERROR: " + err);
                    rej("Couldn't update individual frosh, contact DoIT as metadata and group data were updated.");
                } else {
                    insertFroshToGroup(insertIdx + 1, insertions).then(function () {
                        res();
                    });
                }
            });
        } else {
            res();
        }
    });
}

function insertNewGroupData(insertIdx, newGroupData) {
    return new Promise(function (res, rej) {
            if (insertIdx < newGroupData.length) {
                let data = newGroupData[insertIdx];
                if (data) {
                    dbConn.query("INSERT groups VALUES(?,?,?,?) ON DUPLICATE KEY UPDATE menCount=VALUES(menCount),womenCount=VALUES(womenCount),totalCount=VALUES(totalCount)",
                        [insertIdx, data.menCount, data.womenCount, data.totalCount], function (err) {
                            if (err) {
                                console.log("ERROR: " + err);
                                rej("Couldn't update groups properly. Metadata was updated, contact DoIT to edit the database.")
                            } else {
                                insertNewGroupData(insertIdx + 1, newGroupData).then(function () {
                                    res();
                                });
                            }
                        });
                } else {
                    insertNewGroupData(insertIdx + 1, newGroupData).then(function () {
                        res();
                    });
                }

            } else {
                res();
            }
        }
    );
}

function inArr(assignedFrosh, compareId) {
    for (let i in assignedFrosh) {
        if (assignedFrosh[i] == compareId) { //diff types
            return true;
        }
    }
    return false;
}

function assign(manGroupNum, womanGroupNum, froshToInsert) {
    return new Promise(function (resolve, reject) {
        //determine which frosh goes into which group
        let insertions = [];
        let newGroupData = []; //index will be group number, holds object with the man/woman count
        for (let i = 0; i < froshToInsert.length; i++) {
            let newData = {
                "menCount": 0,
                "womenCount": 0,
                "totalCount": 0
            };
            if (froshToInsert[i].genderIsMan) {
                insertions.push({"groupNum": manGroupNum, "wufooEntryId": froshToInsert[i].id});
                if (newGroupData[manGroupNum]) {
                    newData.menCount = newGroupData[manGroupNum].menCount + 1;
                    newData.womenCount = newGroupData[manGroupNum].womenCount;
                    newData.totalCount = newGroupData[manGroupNum].totalCount + 1;
                    newGroupData[manGroupNum] = newData;
                } else {
                    newData.menCount = 1;
                    newData.totalCount = 1;
                    newGroupData[manGroupNum] = newData;
                }
                manGroupNum = incGroupNum(manGroupNum);
            } else {
                insertions.push({"groupNum": womanGroupNum, "wufooEntryId": froshToInsert[i].id});
                if (newGroupData[womanGroupNum]) {
                    newData.menCount = newGroupData[womanGroupNum].menCount;
                    newData.womenCount = newGroupData[womanGroupNum].womenCount + 1;
                    newData.totalCount = newGroupData[womanGroupNum].totalCount + 1;
                    newGroupData[womanGroupNum] = newData;
                } else {
                    newData.womenCount = 1;
                    newData.totalCount = 1;
                    newGroupData[womanGroupNum] = newData;
                }
                womanGroupNum = incGroupNum(womanGroupNum);
            }
        }
        //update running counter for man and woman group numbers
        dbConn.query("UPDATE groupMetaData SET manGroupNum=?, womanGroupNum=?",
            [manGroupNum, womanGroupNum], function (err) {
                if (err) {
                    console.log("ERROR: " + err);
                    reject("Couldn't update groups.");
                } else {
                    //get the old group data, then add on new group data and update
                    dbConn.query("SELECT * FROM groups", function (err, rows) {
                        if (err) {
                            console.log("ERROR: " + err);
                            reject("Couldn't update group data, metadata was updated so contact DoIT.")
                        } else {
                            if (rows.length) {
                                //previous groups, combine new with old data
                                for (let i = 0; i < rows.length; i++) {
                                    let newData = newGroupData[rows[i].groupNumber];
                                    if (newData) {
                                        newData.totalCount += rows[i].totalCount;
                                        newData.womenCount += rows[i].womenCount;
                                        newData.menCount += rows[i].menCount;
                                    }
                                    newGroupData[rows[i].groupNumber] = newData;
                                }
                            }
                            insertNewGroupData(0, newGroupData).then(function () {
                                //update individual frosh
                                insertFroshToGroup(0, insertions).then(function () {
                                    resolve();
                                }).catch(function (m) {
                                    reject(m);
                                });
                            }).catch(function (m) {
                                reject(m);
                            });
                        }
                    });
                }
            });
    });
}