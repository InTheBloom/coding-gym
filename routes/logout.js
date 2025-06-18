const express = require('express');
const router = express.Router();

router.post('/', function(req, res, next) {
    req.session.destroy(function(err) {
        res.redirect("/login");
    });
});

module.exports = router;
