const express = require('express');
const router = express.Router();

router.post('/register', async (req, res, next) => {
    try {

    } catch(e) {
        return next(e);
    }
});

router.post('/login', async (req, res, next) => {
    try {

    } catch(e) {
        return next(e);
    }
});

module.exports = router;