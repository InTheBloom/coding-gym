const express = require('express');
const router = express.Router();

router.get('/', function(req, res, next) {
    res.render('home', {
        user: {
            username: 'InTheBloom'
        },
    });
});

module.exports = router;
