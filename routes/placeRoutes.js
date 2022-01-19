const express = require('express');
const router = express.Router();
const {
    userIsAuthenticated,
    checkForCorrectUserOrAdmin
} = require('../middleware/auth')
const schemaValidator = require('../helpers/schemaValidator');
const placeCreateSchema = require('../schemata/place/placeCreateSchema.json');
const placeUpdateSchema = require('../schemata/place/placeUpdateSchema.json');
const Place = require('../models/Place')

router.get('/', userIsAuthenticated, async (req, res, next) => {
    try {
        const places = await Place.get();
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

    } catch(e) {
        return next(e);
    }
});

module.exports = router;