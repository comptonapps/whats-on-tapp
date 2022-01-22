const {
    verifyDrink,
    verifyPlace
} = require('./verify');
const Drink = require('../models/Drink');
const Place = require('../models/Place');
const db = require('../db');

let drink;
let place;

beforeAll(async () => {
    drink = await Drink.create({name: 'middleman ale', maker: 'test ales, co'});
    place = await Place.create({name: 'Rita\'s', address: '123 Oak Ave', city: 'Seattle', state: 'WA', zip: '98122'});
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

afterAll(async () => {
    await db.query('DELETE FROM drinks');
    await db.query('DELETE FROM places');
    await db.end();
});