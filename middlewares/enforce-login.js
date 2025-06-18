module.exports = function enforceLogin (req, res, next) {
    if (req.session.userId || req.path === "/login") {
        return next();
    }

    return res.redirect("/login");
};
