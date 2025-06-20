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

    let submittedAnswer;
    try {
        submittedAnswer = await fs.readFile(uploadedFile.path, 'utf-8');
    }
    catch (err) {
        req.session.errorMessage = "ファイルの読み込みに失敗しました。";
        return res.redirect(`/problem/${req.params.problem_number}`);
    }
    const submittedCode = typeof req.body.code === "string" ? req.body.code : "";

    const MAX_CODE_BYTE = 100000;
    if (MAX_CODE_BYTE < Buffer.byteLength(submittedCode, 'utf-8')) {
        req.session.errorMessage = "コードは100KB以下である必要があります。";
        return res.redirect(`/problem/${req.params.problem_number}`);
    }

    // TODO: judgeして結果を返す。
    const isCorrect = true;
    const feedback = "Accepted.";

    // problem_number -> problem_idの変換
    const problem = db.prepare("SELECT id FROM problems WHERE problem_number = ?").get(req.params.problem_number);
    if (!problem) {
        req.session.errorMessage = "問題が存在しません。";
        return res.redirect("/problem");
    }

    // dbへのINSERT
    try {
        db.prepare(`
            INSERT INTO submissions (user_id, problem_id, code, is_correct, feedback)
            VALUES (?, ?, ?, ?, ?)
        `).run(req.session.userId, problem.id, submittedCode, isCorrect ? 1 : 0, feedback);
    }
    catch (err) {
        console.error("dbへのinsertでエラー: ", err);
        req.session.errorMessage = "提出に失敗しました。";
        return res.redirect(`/problem/${req.params.problem_number}`);
    }

    // TODO: submissionsへの転送
    res.redirect(`/problem/${req.params.problem_number}/submissions`);
});

module.exports = router;
