exports.isAdmin = function (req) {
    return req.user.is_admin;
};