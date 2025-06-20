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

module.exports = router;
