const db = require('../db');
const DrinkRating = require('./DrinkRating');
const Drink = require('./Drink');
const User = require('./User');

let u1;
let u2;

let d1;
let d2;

let u1d1rating;
let u1d2rating;

let u2d1rating;
let u2d2rating;

beforeAll(async () => {
    const u1Data = {
        username: "tester1",
        password: "aaaaaaaa",
        email: "test1@fake.com",
        city: "Denver",
        state: "CO"
    };
    const u2Data = {
        username: "tester2",
        password: "aaaaaaaa",
        email: "test2@gake.com",
        city: "Phoenix",
        state: "AZ"
    };
    const d1Data = {
        name: "Beerfaux",
        maker: "Taxi Company"
    };
    const d2Data = {
        name: "New England Winter Ale",
        maker: "Boston Brewing"
    };
    u1 = await User.create(u1Data);
    u2 = await User.create(u2Data);
    d1 = await Drink.create(d1Data);
    d2 = await Drink.create(d2Data);
});

describe('DrinkRating.create method', () => {
    test('it should create a drink rating and return the data', async () => {
        u1d1rating = await DrinkRating.create(u1.id, d1.id, 5);
        expect(u1d1rating.rating).toEqual(5);
        expect(u1d1rating.user_id).toEqual(u1.id);
        expect(u1d1rating.drink_id).toEqual(d1.id);
        u1d2rating = await DrinkRating.create(u1.id, d2.id, 3);
        expect(u1d2rating.rating).toEqual(3);
        expect(u1d2rating.user_id).toEqual(u1.id);
        expect(u1d2rating.drink_id).toEqual(d2.id);
        u2d1rating = await DrinkRating.create(u2.id, d1.id, 2);
        u2d2rating = await DrinkRating.create(u2.id, d2.id, 4);
    });
});

describe('DrinkRating.getRating method', () => {
    test('it should get a rating matching a drink id and user id', async () => {
        const rating = await DrinkRating.getRating(u1.id, d1.id);
        expect(rating.drink_id).toEqual(u1d1rating.drink_id);
        expect(rating.user_id).toEqual(u1d1rating.user_id);
    });
});

describe('DrinkRating.getByDrinkId method', () => {
    test('it should return an array of all drink ratings matching a drink id', async () => {
        const ratings = await DrinkRating.getByDrinkId(d1.id);
        expect(ratings).toEqual([u1d1rating, u2d1rating]);
    });
});

describe('DrinkRating.getByUserId method', () => {
    test('it should return all ratings matching a user id', async () => {
        const ratings = await DrinkRating.getByUserId(u1.id);
        expect(ratings).toEqual([u1d1rating, u1d2rating]);
    })
})

describe('DrinkRating.update method', () => {
    test('it should update a drink rating and return the data', async () => {
        const newRating = await DrinkRating.update(u1d1rating.user_id, u1d1rating.drink_id, 1);
        expect(newRating.rating).toEqual(1);
    });
});

describe('DrinkRating.delete method', () => {
    test('it should delete a drink rating', async () => {
        await DrinkRating.delete(u1d1rating.user_id, u1d1rating.drink_id);
        await expect(() => DrinkRating.getRating(u1d1rating.user_id, u1d1rating.drink_id)).rejects.toThrow(expect.any(Error));
    });
});

afterAll(async () => {
    await db.query('DELETE FROM users');
    await db.query('DELETE FROM drinks')
    await db.query('DELETE FROM drink_ratings')
    await db.end();
})