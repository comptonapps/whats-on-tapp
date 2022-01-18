process.env.NODE_ENV='test';
const db = require('../db');
const PlaceRating = require('./PlaceRating');
const User = require('./User');
const Place = require('./Place');

const userIds = [];
const placeIds = [];
const ratingIds = [];

let u1;
let u2;
let p1;
let p2;
let r1;
let r2;

beforeAll(async () => {
    const u1data = {
        username: "prTu1",
        password: "wwwwwwww",
        email: "prTu1@prtest.com",
        city: "Seattle",
        state: "WA"
    };
    const u2data = {
        username: "prTu2",
        password: "wwwwwwww",
        email: "prTu2@prtest.com",
        city: "Seattle",
        state: "WA"
    };
    const p1data = {
        name: 'prTp1',
        address: '111 test st',
        city: 'Seattle',
        state: 'WA',
        zip: '98115',
        url: 'http://www.prTp1.com',
        phone: '206-555-2565'
    };
    const p2data = {
        name: 'prTp2',
        address: '222 test st',
        city: 'Redmond',
        state: 'WA',
        zip: '98053',
        url: 'http://www.prTp2.com',
        phone: '206-515-2565'
    };
    u1 = await User.create(u1data);
    userIds.push(u1.id);
    u2 = await User.create(u2data);
    userIds.push(u2.id);
    p1 = await Place.create(p1data);
    placeIds.push(p1.id);
    p2 = await Place.create(p2data);
    placeIds.push(p2.id);
});

describe('PlaceRating.create method', () => {
    test('it should create a place rating and return the data', async () => {
        r1 = await PlaceRating.create(u1.id, p1.id, 4);
        r2 = await PlaceRating.create(u2.id, p2.id, 3);
        const { user_id, place_id } = r1;
        ratingIds.push({user_id, place_id});
        expect(r1.user_id).toEqual(u1.id);
        expect(r1.place_id).toEqual(p1.id);
        expect(r1.rating).toEqual(4);
        expect(r1.created_at).toEqual(expect.any(Date));
        expect(r1.updated_at).toEqual(expect.any(Date));
        expect(r2.user_id).toEqual(u2.id);
        expect(r2.place_id).toEqual(p2.id);
        expect(r2.rating).toEqual(3);
        expect(r2.created_at).toEqual(expect.any(Date));
        expect(r2.updated_at).toEqual(expect.any(Date));
    });
});

describe('PlaceRating.get method', () => {
    test('it should return an array of place ratings', async () => {
        const ratings = await PlaceRating.get();
        expect(ratings).toEqual([r1, r2]);
    });
});

describe('PlaceRating.getByPlaceId method', () => {
    test('it should return an array of place ratings by place id', async () => {
        const ratings = await PlaceRating.getByPlaceId(r1.place_id);
        expect(ratings).toEqual([r1]);
    });
});

describe('PlaceRating.getByUserId method', () => {
    test('it should return an array of place ratings that match a user id', async () => {
        const ratings = await PlaceRating.getByUserId(u2.id);
        expect(ratings).toEqual([r2]);
    });
});

describe('PlaceRating.getRating method', () => {
    test('it should return a place rating matching a user id and place id', async () => {
        const rating = await PlaceRating.getRating(u1.id, p1.id);
        expect(rating).toEqual(r1);
    });
});

describe('PlaceRating.update method', () => {
    test('it should update a place rating and return the data', async () => {
        const rating = await PlaceRating.update(u1.id, p1.id, 1);
        expect(rating.rating).toEqual(1);
    });
});

describe('PlaceRating.delete method', () => {
    test('it should delete a place rating', async () => {
        await PlaceRating.delete(r1.user_id, r1.place_id);
        await expect(() => PlaceRating.getRating(r1.user_id, r2.user_id)).rejects.toThrow(expect.any(Error));
    });
});

afterAll(async () => {
    await db.query('DELETE FROM users');
    await db.query('DELETE FROM places');
    await db.end();
})