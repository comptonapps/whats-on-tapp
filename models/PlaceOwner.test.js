process.env.NODE_ENV='test';
const PlaceOwner = require('./PlaceOwner');
const db = require('../db');
const User = require('./User');
const Place = require('./Place');

let user;
let place;

let testUserData = {
    username: 'usertest22',
    password: 'kdfoerfodi',
    email: 'ut@usertest22.com',
    city: 'San Francisco',
    state: 'CA'
};

let testPlaceData = {
    name: "Edna's Tavern",
    address: "123 Main St.",
    city: "Seattle",
    state: "WA",
    zip: "98115",
    url: "http://www.ednas.com", 
    phone: "206-915-8888"
}

beforeAll(async () => {
    user = await User.create(testUserData);
    place = await Place.create(testPlaceData);
});

describe('PlaceOwner.createRelationship method', () => {
    test('it should create a user/place relationship', async () => {
        const owner = await PlaceOwner.createRelationship(user.id, place.id);
        expect(owner.user_id).toEqual(user.id);
        expect(owner.place_id).toEqual(place.id);
        expect(owner.created_at).toEqual(expect.any(Date));
        expect(owner.updated_at).toEqual(expect.any(Date));
    });
});

describe('PlaceOwner.getByIds method', () => {
    test('it should return a relationship with matching place and user id', async () => {
        const rel = await PlaceOwner.getByIds(user.id, place.id);
        expect(rel.user_id).toEqual(user.id);
        expect(rel.place_id).toEqual(place.id);
    });

    test('it should throw an error if relationship does not exist', async () => {
        await expect(() => getByIds(0,0)).toThrow(expect.any(Error));
    });
});

describe('PlaceOwner.delete method', () => {
    test('it should delete a place/owner relationship', async () => {
        const rel = await PlaceOwner.getByIds(user.id, place.id);
        expect(rel.user_id).toEqual(user.id);
        expect(rel.place_id).toEqual(place.id);
        await PlaceOwner.delete(rel.user_id, rel.place_id);
        await expect(() => getByIds(rel.user_id,rel.place_id)).toThrow(expect.any(Error));
    });
});


afterAll(async () => {
    await db.query('DELETE FROM users');
    await db.query('DELETE FROM places');
    await db.query('DELETE FROM place_owners')
    await db.end();
});