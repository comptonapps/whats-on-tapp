process.env.NODE_ENV='test';
const User = require('./User');
const db = require('../db');

let user;

describe('User.create method', () => {
    test('it should create and return an new User', async () => {
        const userData = {
            username: 'usertest',
            password: 'kdfoerfodi',
            email: 'ut@usertest.com',
            city: 'San Francisco',
            state: 'CA'
        };
        const newUser = await User.create(userData);
        user = newUser;
        expect(newUser.id).toEqual(expect.any(Number));
        expect(newUser.username).toEqual(userData.username);
        expect(newUser.email).toEqual(userData.email);
        expect(newUser.city).toEqual(userData.city);
        expect(newUser.state).toEqual(userData.state);
    });
});

describe('User.get method', () => {
    test('it should return an array of users', async () => {
        const users = await User.get();
        expect(users).toEqual([user]);
    });
});

describe('User.getById method', () => {
    test('it should return user data with matching id', async () => {
        const thisUser = await User.getById(user.id);
        expect(thisUser).toEqual(user);
        expect(thisUser.id).toEqual(user.id);
    });
});

describe('User.update method', () => {
    test('it should update user data and return updated user data', async () => {
        const newData = {email: "newemail@hotmail.com", city: "Redding", state: "CA"};
        const updatedUser = await User.update(user.id, newData);
        expect(updatedUser.id).toEqual(user.id);
        expect(updatedUser.city).toEqual(newData.city);
        expect(updatedUser.state).toEqual(newData.state);
        expect(updatedUser.email).toEqual(newData.email);
    });
});

describe('User.delete method', () => {
    test('it should delete a user', async () => {
        await User.delete(user.id);
        await expect(() => User.getById(user.id)).rejects.toThrow(expect.any(Error));
    });
});

afterAll(async () => {
    await db.query('DELETE FROM users');
    await db.end();
});
