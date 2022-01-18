process.env.NODE_ENV='test';
const Draught = require('./Draught');
const Place = require('./Place');
const Drink = require('./Drink');
const db = require('../db');

let d1;
let d2;
let p1;
let p2;
let dt1;
let dt2;

beforeAll(async () => {
    const d1data = {
        name: "Beerx",
        maker: "Breweryx, Inc"
    };
    const d2data = {
        name: "BeerY",
        maker: "BreweryY, Inc"
    };
    const p1data = {
        name: "drTest",
        address: "111 Elm St.",
        city: "Springwood",
        state: "OH",
        zip: "11111",
        url: "http://www.drtest.com",
        phone: "55555555555"
    };
    const p2data = {
        name: "drTest2",
        address: "112 Elm St.",
        city: "Chicago",
        state: "IL",
        zip: "22222",
        url: "http://www.drtest2.com",
        phone: "5553333333"
    };
    d1 = await Drink.create(d1data);
    d2 = await Drink.create(d2data);
    p1 = await Place.create(p1data);
    p2 = await Place.create(p2data);
});

describe('Draught.create method', () => {
    test('', async () => {
        const draught = await Draught.create({place_id: p1.id, drink_id: d1.id});
        dt1 = draught;
        const draught2 = await Draught.create({place_id: p2.id, drink_id: d2.id, active: true});
        dt2 = draught2;
        expect(draught.place_id).toEqual(p1.id);
        expect(draught.drink_id).toEqual(d1.id);
        expect(draught.active).toEqual(false);
        expect(draught.created_at).toEqual(expect.any(Date));
        expect(draught.updated_at).toEqual(expect.any(Date));
        expect(draught2.place_id).toEqual(p2.id);
        expect(draught2.drink_id).toEqual(d2.id);
        expect(draught2.active).toEqual(true);
        expect(draught2.created_at).toEqual(expect.any(Date));
        expect(draught2.updated_at).toEqual(expect.any(Date));
    });
});

describe('Draught.get method', () => {
    test('it should return an array of all draughts', async () => {
        const draughts = await Draught.get();
        expect(draughts).toEqual([dt1, dt2]);
    });
});

describe('Draught.getByDrinkId method', () => {
    test('it should return an array of draughts by drink id', async () => {
        const draughts = await Draught.getByDrinkId(dt1.drink_id);
        expect(draughts).toEqual([dt1]);
    });
});

describe('Draught.getByPlaceId method', () => {
    test('it should return an array of draughts by place id', async () => {
        const draughts = await Draught.getByPlaceId(dt2.place_id);
        expect(draughts).toEqual([dt2]);
    });
});

describe('Draught.getDraught method', () => {
    test('it should return a draught', async () => {
        const draught = await Draught.getDraught(dt1.drink_id, dt1.place_id);
        expect(draught).toEqual(dt1);
    });
});

describe('Draught.update method', () => {
    test('it should update a draught and return the updated data', async () => {
        const updatedDraught = await Draught.update(dt1.drink_id, dt1.place_id, true);
        expect(updatedDraught.active).toEqual(true);
    });
});

describe('Draught.delete method', () => {
    test('it should delete a draught', async () => {
        await Draught.delete(dt1.drink_id, dt1.place_id);
        await expect(() => Draught.getDraught(dt1.drink_id, dt1.place_id)).rejects.toThrow(expect.any(Error));
    });
});

afterAll(async () => {
    await db.query('DELETE FROM drinks');
    await db.query('DELETE FROM places');
    await db.end();
});