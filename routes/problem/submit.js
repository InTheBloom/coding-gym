const express = require('express');
const fs = require('fs').promises;
const router = express.Router({ mergeParams: true });

const { db } = require("../../db");

router.post('/', async function(req, res, next) {
    // TODO: エラー対応
    const uploadedFile = req.files.answer_file;

    try {
        const content = await fs.readFile(uploadedFile.path, 'utf-8');
        console.log(content);
    }
    catch (err) {
        // TODO: エラー対応
        console.log("[submit.js] ERROR:", err);
        res.status(500).send("ファイル読み出し失敗");
        return;
    }

    res.redirect(`/problem/${req.params.problem_number}`);
});

module.exports = router;
