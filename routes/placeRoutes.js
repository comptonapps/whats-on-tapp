const express = require('express');
const router = express.Router();
const {
    userIsAuthenticated,
    checkForCorrectUserOrAdmin
} = require('../middleware/auth')
const schemaValidator = require('../helpers/schemaValidator');
const placeCreateSchema = require('../schemata/place/placeCreateSchema.json');
const placeUpdateSchema = require('../schemata/place/placeUpdateSchema.json');
const placeQuerySchema = require('../schemata/place/placeQuerySchema.json');
const Place = require('../models/Place');
const PlaceRating = require('../models/PlaceRating');

router.get('/', async (req, res, next) => {
    try {
        // INSERT query param logic here. 
        req.query = setValuesToIntegerType(req.query);
        schemaValidator(req.query, placeQuerySchema);
        const places = await Place.get(req.query);
        return res.json({places});
    } catch(e) {
        return next(e);
    }
});


router.get('/:id', userIsAuthenticated, async (req, res, next) => {
    try {
        const { id } = req.params;
        const place = await Place.getById(id);
        return res.json({place});
    } catch(e) {
        return next(e);
    }
});

router.get('/:place_id/rating', userIsAuthenticated, () => {
    try {
        const { place_id } = req.params; 
        const place_ratings = PlaceRating.getByPlaceId(place_id);
        return res.json({place_ratings});
    } catch (e) {
        return next(e);
    }
});

//TODO: Route for draught creation

router.post('/', checkForCorrectUserOrAdmin, async (req, res, next) => {
    try {
        const placeData = req.body;
        schemaValidator(placeData, placeCreateSchema);
        const place = await Place.create(placeData);
        return res.status(201).json({place});
    } catch(e) {
        return next(e);
    }
});

router.patch('/:id', checkForCorrectUserOrAdmin, async (req, res, next) => {
    try {
        const placeData = req.body;
        const { id } = req.params;
        schemaValidator(placeData, placeUpdateSchema);
        const place = await Place.update(id, placeData);
        return res.json({place});
    } catch(e) {
        return next(e);
    }
});

router.delete('/:id', checkForCorrectUserOrAdmin, async (req, res, next) => {
    try {
        const { id } = req.params;
        await Place.delete(id);
        return res.json({message: "deleted"});
    } catch(e) {
        return next(e);
    }
});

function setValuesToIntegerType(obj) {
    if (obj.page) {
        obj.page = +obj.page;
    }

    if (obj.limit) {
        obj.limit = +obj.limit;
    }

    if (obj.asc) {
        if (+obj.asc === 0) {
            obj.asc = false;
        } else {
            obj.asc = true;
        }
    }
    return obj;
}

module.exports = router;