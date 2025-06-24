const express = require('express');
const router = express.Router();

const { db } = require('../db');
const { isValidUsername } = require('../utils/validate-username');
const { isValidPassword } = require('../utils/validate-password');
const bcrypt = require('bcrypt');

router.get('/', (req, res) => {
    const user = db.prepare("SELECT username FROM users WHERE id = ?").get(req.session.userId);

    // TODO: settingsのejsを作る
    res.render('settings');
});

router.post('/change-username', (req, res) => {
    const newUsername = req.body.username;
    const { isValid, reason } = isValidUsername(newUsername);

    if (!isValid) {
        req.session.errorMessage = reason;
        return res.redirect('/settings');
    }

    try {
        const exists = db.prepare("SELECT id FROM users WHERE username = ?").get(newUsername);
        if (exists) {
            req.session.errorMessage = "このユーザ名はすでに使用されています。";
            return res.redirect('/settings');
        }

        db.prepare("UPDATE users SET username = ? WHERE id = ?").run(newUsername, req.session.userId);
        req.session.successMessage = "ユーザ名を変更しました。";
    } catch (err) {
        console.error(err);
        req.session.errorMessage = "ユーザ名の変更に失敗しました。";
    }

    res.redirect('/settings');
});

router.post('/change-password', async (req, res) => {
    const newPassword = req.body.password;
    const { isValid, reason } = isValidPassword(newPassword);

    if (!isValid) {
        req.session.errorMessage = reason;
        return res.redirect('/settings');
    }

    try {
        const hash = await bcrypt.hash(newPassword, 10);
        db.prepare("UPDATE users SET password = ? WHERE id = ?").run(hash, req.session.userId);
        req.session.successMessage = "パスワードを変更しました。";
    } catch (err) {
        console.error(err);
        req.session.errorMessage = "パスワードの変更に失敗しました。";
    }

    res.redirect('/settings');
});

module.exports = router;

