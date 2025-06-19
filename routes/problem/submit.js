const express = require('express');
const fs = require('fs').promises;
const router = express.Router({ mergeParams: true });

const { db } = require("../../db");

router.post('/', async function(req, res, next) {
    const uploadedFile = req.files?.answer_file;
    if (!uploadedFile) {
        req.session.errorMessage = "提出ファイルが見つかりません。";
        return res.redirect(`/problem/${req.params.problem_number}`);
    }

    try {
        const content = await fs.readFile(uploadedFile.path, 'utf-8');
        console.log(content);
    }
    catch (err) {
        req.session.errorMessage = "ファイルの読み込みに失敗しました。";
        return res.redirect(`/problem/${req.params.problem_number}`);
    }

    // TODO: submissionsへの転送
    res.redirect(`/problem/${req.params.problem_number}`);
});

module.exports = router;
