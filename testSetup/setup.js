const User = require('../models/User');
const Drink = require('../models/Drink');
const Place = require('../models/Place');
const PlaceRating = require('../models/PlaceRating');
const DrinkRating = require('../models/DrinkRating');
const PlaceOwner = require('../models/PlaceOwner');
const JWT = require('../helpers/JWT')
const db = require('../db');

const users = [];
const places = [];
const drinks = [];
const placeRatings = [];
const drinkRatings = [];
const placeOwners = [];
const tokens = {};

let userToken; 
let adminToken;

async function testBeforeAll() {
    await db.query('DELETE FROM users');
    await db.query('DELETE FROM drinks');
    await db.query('DELETE FROM places');
    await db.query('DELETE FROM place_owners');
    await db.query('DELETE FROM place_ratings');
    await db.query('DELETE FROM drink_ratings');

    users[0] = dateToStringConversion(await User.create({
        username: 'testUser1',
        password: '7y6y5y4y',
        city: 'Seattle',
        state: 'WA',
        email: 'tu1@tu1.com'
    }));

    tokens.user = JWT.getJWT(users[0]); 

    users[1] = dateToStringConversion(await User.create({
        username: 'testUser2',
        password: '7y6y5y4y',
        city: 'Seattle',
        state: 'WA',
        email: 'tu2@tu1.com'
    }));

    tokens.admin = JWT.getJWT({...users[1], is_admin: true});

    users[2] = dateToStringConversion(await User.create({
        username: 'testUser3',
        password: '7y6y5y4y',
        city: 'Seattle',
        state: 'WA',
        email: 'tu3@tu1.com'
    }));

    drinks[0] = dateToStringConversion(await Drink.create({
        name: 'testDrink1 Ale',
        maker: 'Test Brewing Co.'
    }));

    drinks[1] = dateToStringConversion(await Drink.create({
        name: 'testDrink2 Ale',
        maker: 'Test Brewing Too, Co.'
    }));

    places[0] = dateToStringConversion(await Place.create({
        name: 'testPlace1',
        address: '123 Test St.',
        city: 'Portland',
        state: 'OR',
        zip: '56789',
        url: 'http://www.tp1.com',
        phone: '503-678-9101'
    }));

    places[1] = dateToStringConversion(await Place.create({
        name: 'testPlace2',
        address: '456 Fake Ave',
        city: 'Seattle',
        state: 'WA',
        zip: '98122'
    }));

    placeRatings.push(dateToStringConversion(await PlaceRating.create(users[0].id,places[0].id,4)));

    placeRatings.push(dateToStringConversion(await PlaceRating.create(users[0].id,places[1].id,5)));


    drinkRatings.push(dateToStringConversion(await DrinkRating.create(
        users[0].id,
        drinks[0].id,
        2
    )));

    drinkRatings.push(dateToStringConversion(await DrinkRating.create(
        users[1].id,
        drinks[1].id,
        5
    )));

    placeOwners.push(dateToStringConversion(await PlaceOwner.createRelationship(
        users[1].id,
        places[1].id
    )));

};



async function testBeforeEach() {
    await db.query('BEGIN');
};

async function testAfterEach() {
    await db.query('ROLLBACK')
};

async function testAfterAll() {
    await db.query('DELETE FROM users');
    await db.query('DELETE FROM drinks');
    await db.query('DELETE FROM places');
    await db.query('DELETE FROM place_ratings');
    await db.end();
}

function dateToStringConversion(obj) {
    obj.created_at = obj.created_at.toISOString();
    obj.updated_at = obj.updated_at.toISOString();
    return obj;
};

module.exports = {
    testAfterEach,
    testBeforeAll,
    testBeforeEach,
    testAfterAll,
    tokens,
    userToken,
    adminToken,
    users,
    drinks,
    places,
    placeRatings,
    drinkRatings,
    placeOwners
}
