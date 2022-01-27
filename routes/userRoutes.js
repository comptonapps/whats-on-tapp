const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { userIsAuthenticated, checkForCorrectUserOrAdmin } = require('../middleware/auth');
const { verifyPlace, verifyDrink } = require('../middleware/verify');
const schemaValidator = require('../helpers/schemaValidator');
const userUpdateSchema = require('../schemata/user/userUpdateSchema.json');
const drinkRatingSchema = require('../schemata/drinkRating/drinkRatingSchema.json');
const Place = require('../models/Place');
const PlaceOwner = require('../models/PlaceOwner');
const PlaceRating = require('../models/PlaceRating');
const DrinkRating = require('../models/DrinkRating');


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

router.get('/:user_id/rating/drink', userIsAuthenticated, async (req, res, next) => {
    try {
        const { user_id } = req.params;
        const drink_ratings = await DrinkRating.getByUserId(user_id);
        return res.json({drink_ratings});
    } catch (e) {
        return next(e);
    }
});

router.get('/:user_id/rating/place', userIsAuthenticated, async (req, res, next) => {
    try {
        const { user_id } = req.params;
        const place_ratings = await PlaceRating.getByUserId(user_id);
        return res.json({place_ratings});
    } catch (e) {
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

router.post('/:user_id/rating/place/:place_id', 
            checkForCorrectUserOrAdmin,
            verifyPlace, 
            async (req, res, next) => {
    try {
        const { user_id, place_id } = req.params;
        const { rating } = req.body;
        const place_rating = await PlaceRating.create(user_id, place_id, rating);
        return res.status(201).json({ place_rating });
    } catch(e) {
        return next(e);
    }
});

router.post('/:user_id/rating/drink/:drink_id',
            checkForCorrectUserOrAdmin,
            verifyDrink,
            async (req, res, next) => {
    try {
        const { user_id, drink_id } = req.params;
        const { rating } = req.body;
        schemaValidator({user_id: +user_id, drink_id: +drink_id, rating}, drinkRatingSchema);
        const drink_rating = await DrinkRating.create(user_id, drink_id, rating);
        return res.status(201).json({drink_rating}); 
    } catch(e) {
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

router.patch('/:user_id/rating/place/:place_id', 
            checkForCorrectUserOrAdmin,
            verifyPlace, 
            async (req, res, next) => {
    try {
        const { user_id, place_id } = req.params;
        const { rating } = req.body;
        const place_rating = await PlaceRating.update(user_id, place_id, rating);
        return res.json({ place_rating });
    } catch(e) {
        return next(e);
    }
});

router.patch('/:user_id/rating/drink/:drink_id',
            checkForCorrectUserOrAdmin,
            verifyDrink,
            async (req, res, next) => {
    try {
        const { user_id, drink_id } = req.params;
        const { rating } = req.body;
        schemaValidator({user_id: +user_id, drink_id: +drink_id, rating}, drinkRatingSchema);
        const drink_rating = await DrinkRating.update(user_id, drink_id, rating);
        return res.json({drink_rating}); 
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