const Place = require('../models/Place');
const Drink = require('../models/Drink');
const PlaceOwner = require('../models/PlaceOwner');

async function verifyPlace(req, res, next) {
    try {
        const { place_id } = req.params;
        await Place.getById(place_id);
        return next();
    } catch(e) {
        return next(e)
    }
};

async function verifyDrink(req, res, next) {
    try {
        const { drink_id } = req.params;
        await Drink.getById(drink_id);
        return next();
    } catch(e) {
        return next(e);
    }
};

async function verifyOwnership(req, res, next) {
    try {
        const user = res.locals.user;
        let { place_id } = req.params;
        place_id = +place_id;
        if (user.is_admin) {
            return next();
        }
        await PlaceOwner.getByIds(user.id, place_id);
        return next();
    } catch(e) {
        return next(e);
    }
};

module.exports = {
    verifyPlace,
    verifyDrink,
    verifyOwnership
}