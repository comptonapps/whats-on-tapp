const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { userIsAuthenticated, checkForCorrectUserOrAdmin } = require('../middleware/auth');
const schemaValidator = require('../helpers/schemaValidator');
const userCreateSchema = require('../schemata/user/userCreateSchema.json');
const userUpdateSchema = require('../schemata/user/userUpdateSchema.json');
const Place = require('../models/Place');
const PlaceOwner = require('../models/PlaceOwner');


router.get('/', userIsAuthenticated, async (req, res, next) => {
    try {
        const users = await User.get();
        return res.json({users});
    } catch(e) {
        return next(e);
    }
});

router.get('/:user_id', userIsAuthenticated, async (req, res, next) => {
    try {
        const { user_id } = req.params;
        const user = await User.getById(user_id);
        return res.json({user});
    } catch(e) {
        return next(e);
    }
});

router.post('/', async (req, res, next) => {
    try {

    } catch(e) {
        return next(e);
    }
});

router.post('/:user_id/place', userIsAuthenticated,  async (req, res, next) => {
    try {
        const { user_id } = req.params;
        const place = await Place.create(req.body);
        const place_owner = await PlaceOwner.createRelationship(user_id, place.id);
        return res.status(201).json({place, place_owner});
    } catch (e) {
        return next(e);
    }
});

router.patch('/:user_id', checkForCorrectUserOrAdmin, async (req, res, next) => {
    try {
        const { user_id } = req.params;
        const userData = req.body;
        schemaValidator(userData, userUpdateSchema);
        const user = await User.update(user_id, userData);
        return res.json({user});
    } catch(e) {
        return next(e);
    }
});

router.delete('/:user_id', checkForCorrectUserOrAdmin, async (req, res, next) => {
    try {
        const { user_id } = req.params;
        await User.delete(user_id);
        return res.json({message: 'deleted'});
    } catch(e) {
        return next(e);
    }
});

module.exports = router;