const {
    verifyDrink,
    verifyPlace,
    verifyOwnership
} = require('./verify');
const Drink = require('../models/Drink');
const Place = require('../models/Place');
const User = require('../models/User');
const PlaceOwner = require('../models/PlaceOwner');
const db = require('../db');

let user;
let drink;
let place;
let placeOwner;

beforeAll(async () => {
    
    drink = await Drink.create({name: 'middleman ale', maker: 'test ales, co'});
    place = await Place.create({name: 'Rita\'s', address: '123 Oak Ave', city: 'Seattle', state: 'WA', zip: '98122'});
    user = await User.create({username: 'verifytestuser', password: 'wwwasdwww', city: 'Sacto', state: 'CA', email: 'tupo@zombo.com'});
    placeOwner = await PlaceOwner.createRelationship(user.id, place.id);
})

describe('verifyDrink function', () => {
    test('it should return next if the drink exists', async () => {
        await expect(() => verifyDrink({params: {drink_id: drink.id}}, {}, () => {})).toEqual(expect.any(Function));
    });

    test('it should throw an error if the drink does not exist', async () => {
        expect.assertions(1);
        const next = function (err) {
            expect(err).toBeTruthy();
        }
        await verifyDrink({params: {drink_id: 0}}, {}, next);
    });
});

describe('verifyPlace function', () => {
    test('it should return next if the place exists', async () => {
        await expect(() => verifyDrink({params: {place_id: place.id}}, {}, () => {})).toEqual(expect.any(Function));
    });

    test('it should throw an error if the place does not exist', async () => {
        expect.assertions(1);
        const next = function (err) {
            expect(err).toBeTruthy();
        }
        await verifyPlace({params: {place_id: 0}}, {}, next);
    });
});

describe('verifyOwnership function', () => {
    test('it should return next for valid place_owner ids', async () => {
        expect.assertions(1);
        const next = function (err) {
            expect(err).toBeFalsy();
        }
        const locals = { user: {id: +user.id, is_admin: false}}
        const res = { locals };
        const req = { params : {place_id: +place.id}}
        await verifyOwnership(req, res, next);
    });

    test('it should return next for an admin request', async () => {
        expect.assertions(1);
        const next = function (err) {
            expect(err).toBeFalsy();
        }
        const locals = { user: {id: 0, is_admin: true}}
        const res = { locals };
        const req = { params : {place_id: +place.id}}
        await verifyOwnership(req, res, next);
    });

    test('it should return an error in the next function for bad ids', async () => {
        expect.assertions(1);
        const next = function (err) {
            expect(err).toBeTruthy();
        }
        const locals = { user: {id: 0, is_admin: false}}
        const res = { locals };
        const req = { params : {place_id: 0}}
        await verifyOwnership(req, res, next);
    })
})

afterAll(async () => {
    await db.query('DELETE FROM drinks');
    await db.query('DELETE FROM places');
    await db.query('DELETE FROM users');
    await db.query('DELETE FROM place_owners');
    await db.end();
});