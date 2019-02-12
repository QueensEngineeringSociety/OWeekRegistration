var wufoo = require("../server/wufoo/wufooApi.js");
var builder = require("../server/wufoo/wufooQueryBuilder");
var dbConn = require("../config/database.js");
var con = require("../server/wufoo/wufooConstants");
var User = require("./models/user");
var query = wufoo.queries;

var strongPassRegex = RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\\$%\\^&\\*])(?=.{8,})");
var MAX_AUTO_GROUP = 3;
var MAX_AUTO_MEN = 2;

module.exports = function (app, passport) {

    // =====================================
    // HOME PAGE (with login links) ========
    // =====================================
    app.get('/', function (req, res) {
            if (req.user) {
                res.redirect('filter');
            } else {
                res.render('index.ejs'); // load the index.ejs file}
            }
        }
    );

    // =====================================
    // LOGIN ===============================
    // =====================================
    // show the login form
    app.get('/login', function (req, res) {
        // render the page and pass in any flash data if it exists
        if (req.user) {
            res.redirect('filter');
        } else {
            res.render('login.ejs', {message: req.flash('loginMessage')});
        }
    });

    // process the login form
    app.post('/login', passport.authenticate('local-login', {
        successRedirect: '/filter', // redirect to the secure profile section
        failureRedirect: '/login', // redirect back to the signup page if there is an error
        failureFlash: true // allow flash messages
    }));

    // =====================================
    //USER MGM =============================
    // =====================================
    // show the user addition form
    app.get('/usermanagement', requireAdmin, function (req, res) {
        // render the page and pass in any flash data if it exists
        res.render('users.ejs', {message: req.flash('signupMessage')});
    });

    // process the sign-up of new user
    app.post('/signup', requireAdmin, function (req, res) {
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
                var newUser = new User(req.body.first_name, req.body.last_name, req.body.email, req.body.password, req.body.is_admin === "admin");
                var insertQuery = "INSERT INTO users (first_name,last_name,email,password,created,is_admin) values (?,?,?,?,?,?);";
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

    // process the edit of a user
    app.post('/useredit', requireAdmin, function (req, res) {
        dbConn.query("SELECT * FROM users WHERE email = ?", [req.body.email], function (err, rows) {
            if (err) {
                console.log("ERROR: " + err);
            }
            if (!rows.length) {
                res.render('error.ejs', {errorMessage: "That email doesn't exist"});
            } else if (!strongPassRegex.test(req.body.password)) {
                res.render('error.ejs', {errorMessage: "That password doesn't match the requirements: 1 lowercase, uppercase, number, special character and at least 8 characters long"});
            } else {
                var replacementUser = new User(req.body.first_name, req.body.last_name, req.body.email, req.body.password, req.body.is_admin === "admin");
                var query = "UPDATE users SET first_name=?, last_name=?,email=?,password=?,is_admin=? WHERE id=?;";
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

    app.get('/userdelete', requireAdmin, function (req, res) {
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

    app.post('/userdelete', requireAdmin, function (req, res) {
        var queryString = "";
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

    // =====================================
    // FILTER SECTION =====================
    // =====================================
    // we will want this protected so you have to be logged in to visit
    // we will use route middleware to verify this (the isLoggedIn function)
    app.get('/filter', isLoggedIn, function (req, res) {
        var accessFields = con.generalFields;
        var admin = isAdmin(req);
        if (admin) {
            accessFields = con.allFields;
        }
        wufoo.makeQuery(0, query.all, function (body) {
            dbConn.query("SELECT * FROM groupData", [], function (err, rows) {
                var groupNumbers = [];
                for (var i in rows) {
                    groupNumbers[rows[i].wufooEntryId] = rows[i].groupNum; //i ID is unique
                }
                res.render('filter.ejs', {
                    wufoo: body,
                    groupNumbers: groupNumbers,
                    operators: con.operators,
                    fields: accessFields,
                    headings: con.headings,
                    isAdmin: admin
                });
            });
        });
    });

    // =====================================
    // Age =================================
    // =====================================
    // we will want this protected so you have to be logged in to visit
    // we will use route middleware to verify this (the isLoggedIn function)
    app.get('/age', isLoggedIn, function (req, res) {
        var accessFields = con.generalFields;
        var admin = isAdmin(req);
        if (admin) {
            accessFields = con.allFields;
        }
        wufoo.makeQuery(0, query.age, function (body) {
            dbConn.query("SELECT * FROM groupData", [], function (err, rows) {
                var groupNumbers = [];
                for (var i in rows) {
                    groupNumbers[rows[i].wufooEntryId] = rows[i].groupNum; //i ID is unique
                }
                res.render('filter.ejs', {
                    wufoo: body,
                    groupNumbers: groupNumbers,
                    operators: con.operators,
                    fields: accessFields,
                    headings: con.headings,
                    isAdmin: admin
                });
            });
        });
    });

    // =====================================
    // FOOD RESTRICTIONS====================
    // =====================================
    // we will want this protected so you have to be logged in to visit
    // we will use route middleware to verify this (the isLoggedIn function)
    app.get('/food_restrictions', requireAdmin, function (req, res) {
        wufoo.makeQuery(0, query.foodRestrictions, function (body) {
            dbConn.query("SELECT * FROM groupData", [], function (err, rows) {
                var groupNumbers = [];
                for (var i in rows) {
                    groupNumbers[rows[i].wufooEntryId] = rows[i].groupNum; //i ID is unique
                }
                res.render('filter.ejs', {
                    wufoo: body,
                    groupNumbers: groupNumbers,
                    operators: con.operators,
                    fields: con.allFields,
                    headings: con.headings,
                    isAdmin: true
                });
            });
        });
    });

    // =====================================
    // Primer ==============================
    // =====================================
    // we will want this protected so you have to be logged in to visit
    // we will use route middleware to verify this (the isLoggedIn function)
    app.get('/primer', requireAdmin, function (req, res) {
        wufoo.makeQuery(0, query.wantPrimer, function (body) {
            dbConn.query("SELECT * FROM groupData", [], function (err, rows) {
                var groupNumbers = [];
                for (var i in rows) {
                    groupNumbers[rows[i].wufooEntryId] = rows[i].groupNum; //i ID is unique
                }
                res.render('filter.ejs', {
                    wufoo: body,
                    groupNumbers: groupNumbers,
                    operators: con.operators,
                    fields: con.allFields,
                    headings: con.headings,
                    isAdmin: true
                });
            });
        });
    });

    // =====================================
    // Medical ==============================
    // =====================================
    // we will want this protected so you have to be logged in to visit
    // we will use route middleware to verify this (the isLoggedIn function)
    app.get('/medical', requireAdmin, function (req, res) {
        wufoo.makeQuery(0, query.medicalConcerns, function (body) {
            dbConn.query("SELECT * FROM groupData", [], function (err, rows) {
                var groupNumbers = [];
                for (var i in rows) {
                    groupNumbers[rows[i].wufooEntryId] = rows[i].groupNum; //i ID is unique
                }
                res.render('filter.ejs', {
                    wufoo: body,
                    groupNumbers: groupNumbers,
                    operators: con.operators,
                    fields: con.allFields,
                    headings: con.headings,
                    isAdmin: true
                });
            });
        });
    });

    // =====================================
    // Pronouns ============================
    // =====================================
    // we will want this protected so you have to be logged in to visit
    // we will use route middleware to verify this (the isLoggedIn function)
    app.get('/pronouns', requireAdmin, function (req, res) {
        wufoo.makeQuery(0, query.pronoun, function (body) {
            dbConn.query("SELECT * FROM groupData", [], function (err, rows) {
                var groupNumbers = [];
                for (var i in rows) {
                    groupNumbers[rows[i].wufooEntryId] = rows[i].groupNum; //i ID is unique
                }
                res.render('filter.ejs', {
                    wufoo: body,
                    groupNumbers: groupNumbers,
                    operators: con.operators,
                    fields: con.allFields,
                    headings: con.headings,
                    isAdmin: true
                });
            });
        });
    });

    // =====================================
    // Accessibility =======================
    // =====================================
    // we will want this protected so you have to be logged in to visit
    // we will use route middleware to verify this (the isLoggedIn function)
    app.get('/accessibility', requireAdmin, function (req, res) {
        wufoo.makeQuery(0, query.accessibilityConcerns, function (body) {
            dbConn.query("SELECT * FROM groupData", [], function (err, rows) {
                var groupNumbers = [];
                for (var i in rows) {
                    groupNumbers[rows[i].wufooEntryId] = rows[i].groupNum; //i ID is unique
                }
                res.render('filter.ejs', {
                    wufoo: body,
                    groupNumbers: groupNumbers,
                    operators: con.operators,
                    fields: con.allFields,
                    headings: con.headings,
                    isAdmin: true
                });
            });
        });
    });

    // =====================================
    // PayPerson ===========================
    // =====================================
    // we will want this protected so you have to be logged in to visit
    // we will use route middleware to verify this (the isLoggedIn function)
    app.get('/payPerson', isLoggedIn, function (req, res) {
        var accessFields = con.generalFields;
        var admin = isAdmin(req);
        if (admin) {
            accessFields = con.allFields;
        }
        wufoo.makeQuery(0, query.payInPerson, function (body) {
            dbConn.query("SELECT * FROM groupData", [], function (err, rows) {
                var groupNumbers = [];
                for (var i in rows) {
                    groupNumbers[rows[i].wufooEntryId] = rows[i].groupNum; //i ID is unique
                }
                res.render('filter.ejs', {
                    wufoo: body,
                    groupNumbers: groupNumbers,
                    operators: con.operators,
                    fields: accessFields,
                    headings: con.headings,
                    isAdmin: admin
                });
            });
        });
    });

    // =====================================
    // PayMail ===========================
    // =====================================
    // we will want this protected so you have to be logged in to visit
    // we will use route middleware to verify this (the isLoggedIn function)
    app.get('/payMail', isLoggedIn, function (req, res) {
        var accessFields = con.generalFields;
        var admin = isAdmin(req);
        if (admin) {
            accessFields = con.allFields;
        }
        wufoo.makeQuery(0, query.payByMail, function (body) {
            dbConn.query("SELECT * FROM groupData", [], function (err, rows) {
                var groupNumbers = [];
                for (var i in rows) {
                    groupNumbers[rows[i].wufooEntryId] = rows[i].groupNum; //i ID is unique
                }
                res.render('filter.ejs', {
                    wufoo: body,
                    groupNumbers: groupNumbers,
                    operators: con.operators,
                    fields: accessFields,
                    headings: con.headings,
                    isAdmin: admin
                });
            });
        });
    });

    // =====================================
    // PayOnline ===========================
    // =====================================
    // we will want this protected so you have to be logged in to visit
    // we will use route middleware to verify this (the isLoggedIn function)
    app.get('/payOnline', isLoggedIn, function (req, res) {
        var accessFields = con.generalFields;
        var admin = isAdmin(req);
        if (admin) {
            accessFields = con.allFields;
        }
        wufoo.makeQuery(0, query.payOnline, function (body) {
            dbConn.query("SELECT * FROM groupData", [], function (err, rows) {
                var groupNumbers = [];
                for (var i in rows) {
                    groupNumbers[rows[i].wufooEntryId] = rows[i].groupNum; //i ID is unique
                }
                res.render('filter.ejs', {
                    wufoo: body,
                    groupNumbers: groupNumbers,
                    operators: con.operators,
                    fields: accessFields,
                    headings: con.headings,
                    isAdmin: admin
                });
            });
        });
    });

    // =====================================
    // Unpaid ==============================
    // =====================================
    // we will want this protected so you have to be logged in to visit
    // we will use route middleware to verify this (the isLoggedIn function)
    app.get('/unpaid', isLoggedIn, function (req, res) {
        var accessFields = con.generalFields;
        var admin = isAdmin(req);
        if (admin) {
            accessFields = con.allFields;
        }
        wufoo.makeQuery(0, query.unpaid, function (body) {
            dbConn.query("SELECT * FROM groupData", [], function (err, rows) {
                var groupNumbers = [];
                for (var i in rows) {
                    groupNumbers[rows[i].wufooEntryId] = rows[i].groupNum; //i ID is unique
                }
                res.render('filter.ejs', {
                    wufoo: body,
                    groupNumbers: groupNumbers,
                    operators: con.operators,
                    fields: accessFields,
                    headings: con.headings,
                    isAdmin: admin
                });
            });
        });
    });

    // =====================================
    // SEARCH ==============================
    // =====================================
    // we will want this protected so you have to be logged in to visit
    // we will use route middleware to verify this (the isLoggedIn function)
    app.get('/search', isLoggedIn, function (req, res) {
        if (req.query['field'] && req.query['operator'] && req.query['value']) {
            var accessFields = con.generalFields;
            var admin = isAdmin(req);
            if (admin) {
                accessFields = con.allFields;
            }
            wufoo.makeQuery(0, builder.customQuery(req.query['field'], req.query['operator'], req.query['value']), function (body) {
                dbConn.query("SELECT * FROM groupData", [], function (err, rows) {
                    var groupNumbers = [];
                    for (var i in rows) {
                        groupNumbers[rows[i].wufooEntryId] = rows[i].groupNum; //i ID is unique
                    }
                    res.render('filter.ejs', {
                        wufoo: body,
                        groupNumbers: groupNumbers,
                        operators: con.operators,
                        fields: accessFields,
                        headings: con.headings,
                        isAdmin: admin
                    });
                });
            });
        }
    });

    // =====================================
    // NetID Search ========================
    // =====================================
    // we will want this protected so you have to be logged in to visit
    // we will use route middleware to verify this (the isLoggedIn function)
    app.get('/netid', isLoggedIn, function (req, res) {
        if (req.query['netid_search']) {
            var accessFields = con.generalFields;
            var admin = isAdmin(req);
            if (admin) {
                accessFields = con.allFields;
            }
            wufoo.makeQuery(0, builder.buildNetidQuery(req.query['netid_search']), function (body) {
                dbConn.query("SELECT * FROM groupData", [], function (err, rows) {
                    var groupNumbers = [];
                    for (var i in rows) {
                        groupNumbers[rows[i].wufooEntryId] = rows[i].groupNum; //i ID is unique
                    }
                    res.render('filter.ejs', {
                        wufoo: body,
                        groupNumbers: groupNumbers,
                        operators: con.operators,
                        fields: accessFields,
                        headings: con.headings,
                        isAdmin: admin
                    });
                });
            });
        }
    });

    app.get('/allgroups', requireAdmin, function (req, res) {
        dbConn.query("SELECT * FROM groups", [], function (err, rows) {
            if (err) {
                console.log("ERROR: " + err);
                res.render('error.ejs', {errorMessage: "No groups"});
            } else {
                res.render('groups.ejs', {
                    groups: rows
                });
            }
        });
    });

    app.post('/onegroup', requireAdmin, function (req, res) {
        dbConn.query("SELECT * FROM groupData WHERE groupNum = ?", [req.body.groupNumber], function (err, rows) {
            if (err) {
                console.log("ERROR: " + err);
            }
            if (!rows.length) {
                res.render('error.ejs', {errorMessage: "No groups"});
            } else {
                var entryIds = [];
                for (var i in rows) {
                    entryIds[rows[i].wufooEntryId] = true;
                }
                wufoo.makeQuery(0, query.all, function (body) {
                    var peopleInGroup = [];
                    body = JSON.parse(body);
                    for (var i in body) {
                        if (typeof entryIds[Number(body[i].EntryId)] !== "undefined") {
                            peopleInGroup.push(body[i]);
                        }
                    }
                    dbConn.query("SELECT * FROM groups WHERE groupNumber = ?", [req.body.groupNumber], function (err, rows) {
                        if (err) {
                            console.log("ERROR: " + err);
                        }
                        if (!rows.length) {
                            res.render('error.ejs', {errorMessage: "No groups"});
                        } else {
                            res.render('group.ejs', {
                                groupData: rows[0], //only one group with that group number
                                peopleInGroup: peopleInGroup,
                                fields: con.groupFields,
                                headings: con.headings
                            });
                        }
                    });
                });
            }
        });
    });

    app.get('/assign', requireAdmin, function (req, res) {
        dbConn.query("SELECT * FROM groupMetaData", function (err, rows) {
                if (err) {
                    console.log("ERROR: " + err);
                }
                if (!rows.length) {
                    res.render('error.ejs', {errorMessage: "No metadata could be used to assign groups."});
                } else {
                    var manGroupNum = rows[0].manGroupNum;
                    var womanGroupNum = rows[0].womanGroupNum;
                    //get frosh already in a group
                    dbConn.query("SELECT * FROM groupData", function (err, rows) {
                        var assignedFrosh = [];
                        if (err) {
                            console.log("ERROR: " + err);
                        }
                        if (rows.length) {
                            for (var i in rows) {
                                assignedFrosh.push(rows[i].wufooEntryId);
                            }
                        }
                        wufoo.makeQuery(0, query.all, function (body) {
                            //show updated groups
                            body = JSON.parse(body);
                            var insertions = [];
                            for (var i in body) {
                                if (!inArr(assignedFrosh, body[i].EntryId)) {
                                    insertions.push({
                                        "id": body[i].EntryId,
                                        "genderIsMan": isMan((body[i])[con.allFields.pronouns])
                                    });
                                }
                            }
                            assign(manGroupNum, womanGroupNum, insertions).then(function () {
                                res.redirect("back"); //refresh
                            }).catch(function (errMessage) {
                                res.render('error.ejs', {errorMessage: errMessage});
                            });
                        });
                    });
                }
            }
        );
    });

    function inArr(assignedFrosh, compareId) {
        for (var i in assignedFrosh) {
            if (assignedFrosh[i] == compareId) { //diff types
                return true;
            }
        }
        return false;
    }

    function assign(manGroupNum, womanGroupNum, froshToInsert) {
        return new Promise(function (resolve, reject) {
            //determine which frosh goes into which group
            var insertions = [];
            var newGroupData = []; //index will be group number, holds object with the man/woman count
            for (var i = 0; i < froshToInsert.length; i++) {
                var newData = {
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
                        newGroupData.splice(manGroupNum, 0, newData);
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
                        newGroupData.splice(womanGroupNum, 0, newData);
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
                                //TODO REJECT
                            } else {
                                if (rows.length) {
                                    //previous groups, combine new with old data
                                } else {
                                    //no previous groups, just insert
                                    insertNewGroupData(0, newGroupData).then(function () {
                                        //call next thing to update
                                        resolve();
                                    });
                                }
                            }
                        });
                    }
                });
        });
    }

    function insertNewGroupData(insertIdx, newGroupData) {
        return new Promise(function (res) {
                if (insertIdx < newGroupData.length) {
                    var data = newGroupData[insertIdx];
                    dbConn.query("INSERT groups values(?,?,?,?)",
                        [insertIdx, data.menCount, data.womenCount, data.totalCount], function (err, rows) {
                            if (err) {
                                console.log("ERROR: " + err);
                                //TODO reject everywhere
                            } else {
                                insertNewGroupData(insertIdx + 1, newGroupData).then(function () {
                                    res();
                                });
                            }
                        });
                } else{
                    res();
                }
            }
        );
    }

    // insertFroshToGroup(0, insertions, worldRes);

    function insertFroshToGroup(insertIdx, insertions, worldRes) {
        return new Promise(function (res) {
            if (insertIdx < insertions.length) {
                var id = insertions[insertIdx].wufooEntryId;
                var num = insertions[insertIdx].groupNum;
                dbConn.query("insert groupData values(?,?)", [id, num], function (err) {
                    if (err) {
                        console.log("ERROR: " + err);
                        worldRes.render('error.ejs', {errorMessage: "Couldn't update groups properly. Metadata was updated, contact DoIT to edit database."});
                        //TODO reject
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

    function incGroupNum(num) {
        return (num + 1) % MAX_AUTO_GROUP;
    }

    function isMan(text) {
        //if doesn't use she or her as pronoun, assume man
        text = text.toLowerCase();
        return text.indexOf("she") === -1 && text.indexOf("her") === -1;
    }

    // =====================================
    // NOT AUTHORIZED ======================
    // =====================================
    app.get('/error', isLoggedIn, function (req, res) {
        res.render('error.ejs', {errorMessage: "You don't have the privileges to see this."});
    });

    // =====================================
    // LOGOUT ==============================
    // =====================================
    app.get('/logout', function (req, res) {
        req.logout();
        res.redirect('/');
    });
};

// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {
    // if user is authenticated in the session, carry on
    if (req.isAuthenticated())
        return next();

    // if they aren't redirect them to the home page
    res.redirect('/');
}

function requireAdmin(req, res, next) {
    if (!req.isAuthenticated()) {
        res.redirect('/');
    } else if (req.user && req.user.is_admin) {
        return next();
    } else {
        res.redirect('/error');
    }
}

function isAdmin(req) {
    return req.user.is_admin;
}