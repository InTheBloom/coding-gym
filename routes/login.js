const express = require('express');
const router = express.Router();
const { db } = require("../db");
const crypto = require("crypto");

router.get('/', function(req, res, next) {
    res.render('login', {
        error: undefined
    });
});

router.post('/', function(req, res, next) {
    const { username, password } = req.body;
    const findUserByUserName = db.prepare("SELECT id, username, password_hash FROM users WHERE username = ?");
    const foundUser = findUserByUserName.get(username);
    const hashedPassword = crypto.createHash("sha256").update(password).digest("hex");

    if (!foundUser || hashedPassword !== foundUser.password_hash) {
        res.render('login', {
            error: "ユーザ名またはパスワードが違います。"
        });
        return;
    }

    req.session.userId = foundUser.id;
    res.redirect("/");
});

module.exports = router;
