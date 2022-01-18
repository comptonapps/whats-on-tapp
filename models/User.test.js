process.env.NODE_ENV='test';
const User = require('./User');
const db = require('../db');

describe('User class create method', () => {
    test('it should create and return an new User', async () => {
        const userData = {
            username: 'usertest',
            password: 'kdfoerfodi',
            email: 'ut@usertest.com',
            city: 'San Francisco',
            state: 'CA'
        };
        const newUser = await User.create(userData);
        expect(newUser.id).toEqual(expect.any(Number));
        expect(newUser.username).toEqual(userData.username);
        expect(newUser.email).toEqual(userData.email);
        expect(newUser.city).toEqual(userData.city);
        expect(newUser.state).toEqual(userData.state);
    });
});

afterAll(async () => {
    await db.query('DELETE FROM users');
    await db.end();
});
