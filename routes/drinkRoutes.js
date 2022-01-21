const express = require('express');
const router = express.Router();
const { 
    userIsAuthenticated,
    checkForCorrectUserOrAdmin 
} = require('../middleware/auth');
const drinkCreateSchema = require('../schemata/drink/drinkCreateSchema.json');
const drinkUpdateSchema = require('../schemata/drink/drinkUpdateSchema.json');
const schemaValidator = require('../helpers/schemaValidator');
const Drink = require('../models/Drink');

router.get('/', userIsAuthenticated, async (req, res, next) => {
    try {
        const drinks = await Drink.get();
        return res.json({drinks});
    } catch(e) {
        return next(e);
    }
});

router.get('/:id', userIsAuthenticated, async (req, res, next) => {
    try {
        const { id } = req.params;
        const drink = await Drink.getById(id);
        return res.json({drink});
    } catch(e) {
        return next(e);
    }
});

router.post('/', checkForCorrectUserOrAdmin, async (req, res, next) => {
    try {
        const drinkData = req.body;
        schemaValidator(drinkData, drinkCreateSchema);
        const drink = await Drink.create(drinkData);
        return res.status(201).json({drink});
    } catch(e) {
        return next(e);
    }
});

router.patch('/:id', checkForCorrectUserOrAdmin, async (req, res, next) => {
    try {
        const { id } = req.params;
        const drinkData = req.body;
        schemaValidator(drinkData, drinkUpdateSchema);
        const drink = await Drink.update(id, drinkData);
        return res.json({drink});
    } catch(e) {
        return next(e);
    }
});

router.delete('/:id', checkForCorrectUserOrAdmin, async (req, res, next) => {
    try {
        const { id } = req.params;
        await Drink.delete(id);
        return res.json({message: "deleted"});
    } catch(e) {
        return next(e);
    }
});

module.exports = router;