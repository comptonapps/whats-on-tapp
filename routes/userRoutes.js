const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { userIsAuthenticated } = require('../middleware/auth');
const Place = require('../models/Place');
const PlaceOwner = require('../models/PlaceOwner');


router.get('/', async (req, res, next) => {
    try {

    } catch(e) {
        return next(e);
    }
});

router.get('/:id', async (req, res, next) => {
    try {

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

router.patch('/:id', async (req, res, next) => {
    try {

    } catch(e) {
        return next(e);
    }
});

router.delete('/:id', async (req, res, next) => {
    try {

    } catch(e) {
        return next(e);
    }
});

module.exports = router;