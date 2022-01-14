const authenticateUser = require('./authenticateUser');
const db = require('../db');
const User = require('../models/User');
const { BadRequestError } = require('../expressError');
const testPassword = 'qqqqqqqq'
const testUserData = {
    "username": "testauthuser",
    "password" : testPassword,
    "email" : 'tau@tau.com',
    "city" : "Spokane",
    "state" : "WA"
}
let testUser;

beforeAll( async () => {
    testUser = await User.create(testUserData);
});

describe('authenticateUser method', () => {
    test('it should authenticate a user and return user data', async () => {
        const user = await authenticateUser(testUserData.username, testPassword);
        expect(user.username).toEqual(testUserData.username);
    });

    test('it should throw a BadRequestError if a user does not exist', async () => {
        await expect(() => authenticateUser('badusername', testUserData.password)).rejects.toThrow('Invalid username or password'); 
    });

    test('it should throw a BadRequestError if a password is incorrect', async () => {
        await expect(() => authenticateUser(testUserData.username, 'badpassword')).rejects.toThrow(expect.any(BadRequestError)); 
    });
});

afterAll(async () => {
    await db.query(`DELETE FROM users WHERE username='testauthuser'`);
    db.end();
});