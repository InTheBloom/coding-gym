const express = require('express');
const submitRouter = require('./submit');
const router = express.Router();

router.get('/', function(req, res, next) {
    res.render('problem/list', {
        problemsByCategory: {
            "basic data processing": [
                {
                    id: 1,
                    problem_number: 1,
                    title: "Hello, World!",
                    description: "Hello World!という文字列を出力してください。",
                    category: "basic data processing",
                    points: 100,
                    is_published: 1,
                    created_at: "2017-12-05 00:00:00",
                }
            ]
        }
    });
});

router.get('/:problem_number', function(req, res, next) {
    res.render('problem/detail', {
        problem: {
            id: 1,
            problem_number: 1,
            title: "Hello, World!",
            description: "Hello World!という文字列を出力してください。",
            category: "basic data processing",
            points: 100,
            is_published: 0,
            created_at: "2017-12-05 00:00:00",
        }
    });
});

router.use('/:problem_number/submit', submitRouter);

module.exports = router;
