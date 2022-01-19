process.env.NODE_ENV='test';
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
        place = await Place.create(placeData);
        expect(place).toEqual({
            ...placeData, 
            id: expect.any(Number),
            created_at: expect.any(Date),
            updated_at: expect.any(Date)
        });
    });
});

describe('Place.get method', () => {
    test('it should return an array of places', async () => {
        const places = await Place.get();
        expect(places).toEqual([place]);
    });
});

describe('Place.getById method', () => {
    test('it should return place data matching a passed in id', async () => {
        const p = await Place.getById(place.id);
        expect(p).toEqual(place);
    });
});

describe('Place.update method', () => {
    test('it should update a place and return it\'s data', async () => {
        const newData = {
            name: "Joe's Pub",
            address: "987 Rainbow Ave",
            city: "Miami",
            state: "FL",
            zip: "88888",
            url: "http://www.joespubmiami.com",
            phone: "5556667777"
        };
        const updatedPlace = await Place.update(place.id, newData);
        expect(updatedPlace.id).toEqual(place.id);
        expect(updatedPlace.name).toEqual(newData.name);
        expect(updatedPlace.address).toEqual(newData.address);
        expect(updatedPlace.city).toEqual(newData.city);
        expect(updatedPlace.state).toEqual(newData.state);
        expect(updatedPlace.zip).toEqual(newData.zip);
        expect(updatedPlace.url).toEqual(newData.url);
        expect(updatedPlace.phone).toEqual(newData.phone);
        expect(updatedPlace.created_at).toEqual(expect.any(Date));
        expect(updatedPlace.updated_at).toEqual(expect.any(Date));
        expect(updatedPlace.updated_at).not.toEqual(place.updated_at);
    });
});

describe('Place.delete method', () => {
    test('it should delete a place', async () => {
        await Place.delete(place.id);
        await expect(() => Place.getById(place.id)).rejects.toThrow(expect.any(Error));
    });
});


afterAll(async () => {
    await db.query(`DELETE FROM ${DB_TABLES.PLACES}`);
    await db.end();
});