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
    const { password: newPassword, old_password: oldPassword } = req.body;
    const { isValid, reason } = isValidPassword(newPassword);

    // dbのパスワードと一致してるかチェック
    const foundUser = db.prepare("SELECT id, password_hash FROM users WHERE id = ?").get(req.session.userId);
    if (!(await bcrypt.compare(oldPassword, foundUser.password_hash))) {
        req.session.errorMessage = "旧パスワードが違います。";
        return res.redirect('/settings');
    }

    if (!isValid) {
        req.session.errorMessage = reason;
        return res.redirect('/settings');
    }

    try {
        const hash = await bcrypt.hash(newPassword, 10);
        db.prepare("UPDATE users SET password_hash = ? WHERE id = ?").run(hash, req.session.userId);
        req.session.successMessage = "パスワードを変更しました。";
    } catch (err) {
        console.error(err);
        req.session.errorMessage = "パスワードの変更に失敗しました。";
    }

    res.redirect('/settings');
});

module.exports = router;

