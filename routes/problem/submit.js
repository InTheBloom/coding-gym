const express = require('express');
const router = express.Router({ mergeParams: true });
const { db } = require("../../db");
const crypto = require("crypto");

router.post('/', function(req, res, next) {
    console.log(`POST request to /problem/${req.params.id}/submit`);
    res.redirect(`/problem/${req.params.id}`);
});

module.exports = router;
