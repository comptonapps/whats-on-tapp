const express = require('express');
const router = express.Router();
const User = require('../models/User');
const JWT = require('../helpers/JWT');
const schemaValidator = require('../helpers/schemaValidator');
const userCreateSchema = require('../schemata/user/userCreateSchema.json');
const authenticateUser = require('../helpers/authenticateUser');

router.post('/register', async (req, res, next) => {
    try {
        const data = req.body;
        schemaValidator(data, userCreateSchema);
        const user = await User.create(data);
        const token = JWT.getJWT(user);
        return res.status(201).json({user, token});
    } catch(e) {
        return next(e);
    }
});

router.post('/login', async (req, res, next) => {
    try {
        const { username, password } = req.body;
        const user = await authenticateUser(username, password);
        const token = JWT.getJWT(user);
        return res.json({user, token});
    } catch(e) {
        return next(e);
    }
});

module.exports = router;