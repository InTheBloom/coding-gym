const express = require('express');
const router = express.Router({ mergeParams: true });

const { db } = require("../../db");

router.get('/', function(req, res, next) {
    // problem_number -> problem id変換
    const problem = db.prepare("SELECT id, problem_number, title FROM problems WHERE problem_number = ?").get(req.params.problem_number);
    if (!problem) {
        req.session.errorMessage = `問題${req.params.problem_number}が存在しません。`;
        return res.redirect("/problem");
    }

    // submissionsからSELECTで引っ張ってくる。
    const submissions = db.prepare(`
        SELECT s.id, s.submitted_at, s.is_correct, s.feedback, u.username
        FROM submissions s
        JOIN users u
        ON s.user_id = u.id
        WHERE problem_id = ?
        ORDER BY submitted_at DESC
    `).all(problem.id);

    res.render("problem/submissions", { problem, submissions });
});

router.get('/:submission_id', function(req, res, next) {
    // 個別提出詳細
    const submission = db.prepare(`
        SELECT s.*, u.username, p.problem_number, p.title
        FROM submissions s
        JOIN users u ON s.user_id = u.id
        JOIN problems p ON s.problem_id = p.id
        WHERE s.id = ?
    `).get(req.params.submission_id);

    if (!submission) {
        console.error(`不正な提出クエリ id = ${req.params.submission_id}`);
        req.session.errorMessage = "提出が見つかりません。";
        return res.redirect(`/problem/${req.params.problem_number}`);
    }

    res.render("problem/submission", { submission });
});

module.exports = router;
