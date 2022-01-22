const Place = require('../models/Place');
const Drink = require('../models/Drink');

async function verifyPlace(req, res, next) {
    const { place_id } = req.params;
    await Place.getById(place_id);
    return next();
};

async function verifyDrink(req, res, next) {
    const { drink_id } = req.params;
    await Drink.getById(drink_id);
    return next();
};

module.exports = {
    verifyPlace,
    verifyDrink
}