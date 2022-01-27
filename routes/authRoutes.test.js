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

    test('it should return a 400 error code and message for trying to create a user with already existing username', async () => {
        const response = await request(app).post('/auth/register').send({...testUserData, email: 'different@email.com'});
        expect(response.status).toBe(400);
        expect(response.body.message).toEqual('Username or email already in use');
    });

    test('it should return a 400 error code and message for trying to create a user with already existing username', async () => {
        const response = await request(app).post('/auth/register').send({...testUserData, username: 'different'});
        expect(response.status).toBe(400);
        expect(response.body.message).toEqual('Username or email already in use');
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

    test('it should respond with a 401 error code and message for bad password', async () => {
        const response = await request(app).post('/auth/login').send({username: testUserData.username, password: 'badpassword'});
        expect(response.status).toBe(401);
        expect(response.body.message).toEqual('Invalid username or password');
    });

    test('it should respond with a 401 error code and message or a bad username', async () => {
        const response = await request(app).post('/auth/login').send({username: 'bad username', password: testUserData.password});
        expect(response.status).toBe(401);
        expect(response.body.message).toEqual('Invalid username or password');
    });
});

afterAll(async () => {
    await db.query('DELETE FROM users');
    await db.end();
});