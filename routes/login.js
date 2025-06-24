const express = require('express');
const router = express.Router();
const { db } = require("../db");
const bcrypt = require("bcrypt");

router.get('/', function(req, res, next) {
    // ログイン状態でアクセスしたらリダイレクト
    if (req.session.userId) {
        return res.redirect("/");
    }

    res.render('login');
});

router.post('/', async function(req, res, next) {
    const { username, password } = req.body;
    const findUserByUserName = db.prepare("SELECT id, username, password_hash FROM users WHERE username = ?");
    const foundUser = findUserByUserName.get(username);

    let badLogin = false;
    if (!foundUser) {
        badLogin = true;
    }
    else {
        const cmp = await bcrypt.compare(password, foundUser.password_hash);
        if (!cmp) {
            badLogin = true;
        }
    }

    if (badLogin) {
        res.render('login', {
            errorMessage: "ユーザ名またはパスワードが違います。"
        });
        return;
    }

    req.session.userId = foundUser.id;
    res.redirect("/");
});

module.exports = router;
