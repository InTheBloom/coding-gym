const express = require('express');
const submitRouter = require('./submit');
const submissionsRouter = require('./submissions');
const router = express.Router();
const { db } = require('../../db.js');
const mdRender = require('../../utils/md-render');

router.get('/', function(req, res, next) {
    const allProblems = db.prepare('SELECT id, problem_number, title, category, points, is_published, created_at FROM problems ORDER BY problem_number').all();
    const problemsByCategory = {};
    for (const p of allProblems) {
        const cate = p.category;

        if (!problemsByCategory[cate]) {
            problemsByCategory[cate] = [];
        }

        problemsByCategory[cate].push(p);
    }

    res.render('problem/list', { problemsByCategory });
});

router.get('/:problem_number', function(req, res, next) {
    const problem = db.prepare('SELECT * FROM problems WHERE problem_number = ?').get(req.params.problem_number);

    problem.description = mdRender(problem.description);

    if (!problem) {
        console.error("問題取得失敗");
        req.session.errorMessage = '問題が存在しません。';
        return res.redirect('/problem');
    }

    // テストケースパス変換
    if (problem.testcase_input_file) {
        problem.testcase_input_file = problem.testcase_input_file.replace(/^public\//, '/');
    }

    res.render('problem/detail', { problem });
});

router.use('/:problem_number/submit', submitRouter);
router.use('/:problem_number/submissions', submissionsRouter);

module.exports = router;
