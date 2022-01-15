process.env.NODE_ENV='test';
const request = require('supertest');
const app = require('../app');
const db = require('../db');
const jwt = require('jsonwebtoken');
let testUserData = {
    username: 'testfoo',
    password: 'qqqqqqqq',
    email: 'foo@test.com',
    city: 'footown',
    state: 'WV'
}

describe('POST /auth/register', () => {
    test('it should create a user and return user data', async () => {
        const response = await request(app).post('/auth/register').send(testUserData);
        const { user } = response.body;
        expect(user.username).toEqual(testUserData.username);
        expect(response.status).toBe(201);
    });
});

describe('POST /auth/login', () => {
    test('it should authenticate a user with valid username and password', async () => {
        const response = await request(app).post('/auth/login').send({username: testUserData.username, password: testUserData.password});
        const payload = jwt.decode(response.body.token);
        expect(response.body.token).toEqual(expect.any(String));
        expect(response.body.user.username).toEqual(testUserData.username);
        expect(payload.username).toEqual(testUserData.username);
        
    });
});

afterAll(async () => {
    await db.query('DELETE FROM users');
    db.end();
});