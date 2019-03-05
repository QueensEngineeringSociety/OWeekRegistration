exports.routes = {
    HOME: "/",
    LOGIN: "/login",
    USER_MANAGEMENT: "/usermanagement",
    SIGN_UP: "/signup",
    USER_EDIT: "/useredit",
    USER_DELETE: "/userdelete",
    FILTER: "/filter",
    AGE: "/age",
    FOOD_RESTRICTIONS: "/food_restrictions",
    PRIMER: "/primer",
    MEDICAL: "/medical",
    PRONOUNS: "/pronouns",
    ACCESSIBILITY: "/accessibility",
    PAY_PERSON: "/payPerson",
    PAY_ONLINE: "/payOnline",
    PAY_MAIL: "/payMail",
    UNPAID: "/unpaid",
    SEARCH: "/search",
    NET_ID: "/netid",
    ALL_GROUPS: "/allgroups",
    ONE_GROUP: "/onegroup",
    UPDATE_MAXNUM: "/updatemaxnum",
    ASSIGN: "/assign",
    CLEAR_GROUPS: "/cleargroups",
    ERROR: "/error",
    LOGOUT: "/logout"
};

exports.views = {
    INDEX: "index.ejs",
    DELETE_USERS: "deleteusers.ejs",
    ERROR: "error.ejs",
    FILTER: "filter.ejs",
    GROUP: "group.ejs",
    GROUPS: "groups.ejs",
    LOGIN: "login.ejs",
    SEARCH: "search.ejs",
    USERS: "users.ejs"
};

exports.isAdmin = function (req) {
    return req.user.is_admin;
};

exports.valInObj = function (val, obj) {
    return Object.values(obj).indexOf(val) > -1;
};