const db = require('../db');
const Place = require('./Place');
const { DB_TABLES } = require('../constants');
let place;
const placeData = {
    name: "Edna's Tavern",
    address: "123 Main St.",
    city: "Seattle",
    state: "WA",
    zip: "98115",
    url: "http://www.ednas.com", 
    phone: "206-915-8888"

}

describe('Place.create method', () => {
    test('it should create and return a place', async () => {
        const place = await Place.create(placeData);
        expect(place).toEqual({
            ...placeData, 
            id: expect.any(Number),
            created_at: expect.any(Date),
            updated_at: expect.any(Date)
        });

    });
});

afterAll(async () => {
    await db.query(`DELETE FROM ${DB_TABLES.PLACES}`);
    db.end();
});