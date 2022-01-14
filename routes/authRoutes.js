const express = require('express');
const router = express.Router();
const User = require('../models/User');

router.post('/register', async (req, res, next) => {
    try {
        return res.status(201).json({created: true});
    } catch(e) {
        return next(e);
    }
});

router.post('/login', async (req, res, next) => {
    try {
        return res.json({login: true});
    } catch(e) {
        return next(e);
    }
});

module.exports = router;