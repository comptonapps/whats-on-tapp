process.env.NODE_ENV='test';
const request = require('supertest');
const app = require('../app');
const db = require('../db');
const User = require('../models/User');
const JWT = require('../helpers/JWT');

let u1;
let u2;

let token;
let adminToken;

beforeAll(async () => {
    const u1Data = {
        username: "userTestUser",
        password: "wwwwwwww",
        email: "utu@utu.com",
        city: "Seabrook",
        state: "ME"
    };
    const u2Data = {
        username: "userTestUser2",
        password: "wwwwwwww",
        email: "utu2@utu.com",
        city: "Richmond",
        state: "VA"
    };

    u1 = await User.create(u1Data);
    u2 = await User.create(u2Data);
    u1.created_at = u1.created_at.toISOString();
    u1.updated_at = u1.updated_at.toISOString();
    u2.created_at = u2.created_at.toISOString();
    u2.updated_at = u2.updated_at.toISOString();

    token = JWT.getJWT({...u1});
    adminToken = JWT.getJWT({...u2, is_admin: true});
});

describe('GET /user', () => {
    test('it should return an array of users upon authenticated user request', async () => {
        const response = await request(app).get('/user').set('authorization', `Bearer ${token}`);
        expect(response.status).toBe(200);
        const users = response.body.users;
        expect(users).toEqual([u1, u2]);
    });

    test('it should return an array of users upon admin request', async () => {
        const response = await request(app).get('/user').set('authorization', `Bearer ${adminToken}`);
        expect(response.status).toBe(200);
        const users = response.body.users;
        expect(users).toEqual([u1, u2]);
    });

    test('it should return a 403 code for no user token', async () => {
        const response = await request(app).get('/user');
        expect(response.status).toBe(403);
    });

    test('it should return a 403 code for non-valid token', async () => {
        const response = await request(app).get('/user').set('authorization', `Bearer goofy`);
        expect(response.status).toBe(403);
    });
});

describe('GET /user/:user_id', () => {
    test('it should return a 403 code and error message for a no token request', async () => {
        const response = await request(app).get(`/user/${u1.id}`);
        expect(response.status).toBe(403);
        expect(response.body.message).toEqual('Authentication required');
    });

    test('it should return a 403 code and error message for a bad token request', async () => {
        const response = await request(app).get(`/user/${u1.id}`).set('authorization', `Bearer badToken3.idgaf`);
        expect(response.status).toBe(403);
        expect(response.body.message).toEqual('Authentication required');
    });

    test('it should return a 404 error code for a request with a non-existent user id', async () => {
        const response = await request(app).get(`/user/0`).set('authorization', `Bearer ${token}`);
        expect(response.status).toBe(404);
        expect(response.body.message).toEqual('Record not found in users');
    });

    test('it should return user data for a request from an authenticated user', async () => {
        const response = await request(app).get(`/user/${u1.id}`).set('authorization', `Bearer ${token}`);
        expect(response.status).toBe(200);
        expect(response.body.user).toEqual(u1);
    });
});

describe('PATCH /users/:user_id', () => {
    const updateData = {
        email: 'updateEmail@ue.com',
        city: 'Atlanta',
        state: 'GA'
    };

    test('it should return a 403 error code and message for a no token request', async () => {
        const response = await request(app).patch(`/user/${u1.id}`).send(updateData);
        expect(response.status).toBe(403);
        expect(response.body.message).toEqual('Unauthorized user');
    });

    test('it should return a 403 error code and message for a bad token request', async () => {
        const response = await request(app).patch(`/user/${u1.id}`).set('authorization', `Bearer badtoken`).send(updateData);
        expect(response.status).toBe(403);
        expect(response.body.message).toEqual('Unauthorized user');
    });

    test('it should respond with a 404 error code and message for a user id that is non-existent (admin request)', async () => {
        const response = await request(app).patch(`/user/0`).set('authorization', `Bearer ${adminToken}`).send(updateData);
        expect(response.status).toBe(404);
        expect(response.body.message).toEqual('Record not found in users');
    });

    test('it should respond with a 403 error code and message for a non matching token id and user id to be updated', async () => {
        const response = await request(app).patch(`/user/${u2.id}`).set('authorization', `Bearer ${token}`).send(updateData);
        expect(response.status).toBe(403);
    });

    test('it should respond with a 400 error code for extra fields in the update data object', async () => {
        const response = await request(app).patch(`/user/${u1.id}`).set('authorization', `Bearer ${token}`).send({...updateData, foo: 'bar'});
        expect(response.status).toBe(400);
        console.log('body', response.body);
    });

    test('it should update a user and return the user data for an authenticated user with a matching id', async () => {
        const response = await request(app).patch(`/user/${u1.id}`).set('authorization', `Bearer ${token}`).send(updateData);
        expect(response.status).toBe(200);
        const updatedUser = response.body.user;
        expect(updatedUser.id).toEqual(u1.id);
        expect(updatedUser.email).toEqual(updateData.email);
        expect(updatedUser.city).toEqual(updateData.city);
        expect(updatedUser.state).toEqual(updateData.state);
    });
});

describe('DELETE /users/:user_id', () => {
    test('it should respond with a 403 error code and message for a non-authenticated user', async () => {
        const response = await request(app).delete(`/user/${u1.id}`);
        expect(response.status).toBe(403);
        expect(response.body.message).toEqual('Unauthorized user');
    });

    test('it shuold respond with a 403 error code and message for a bad token request', async () => {
        const response = await request(app).delete(`/user/${u1.id}`).set('authorization', `Bearer foobar`);
        expect(response.status).toBe(403);
        expect(response.body.message).toEqual('Unauthorized user');
    });

    test('it should delete a user for an admin token request', async () => {
        const response = await request(app).delete(`/user/${u2.id}`).set('authorization', `Bearer ${adminToken}`);
        expect(response.status).toBe(200);
        const check = await request(app).get(`/user/${u2.id}`).set('authorization', `Bearer ${adminToken}`);
        expect(check.status).toBe(404);
    });

    test('it should delete a user with a token id that matches the route id', async () => {
        const response = await request(app).delete(`/user/${u1.id}`).set('authorization', `Bearer ${token}`);
        expect(response.status).toBe(200);
        const check = await request(app).get(`/user/${u1.id}`).set('authorization', `Bearer ${adminToken}`);
        expect(check.status).toBe(404);
    });
    
    test('it should respond with a 404 error code for a non-existent user', async () => {
        const response = await request(app).delete(`/user/0`).set('authorization', `Bearer ${adminToken}`);
        expect(response.status).toBe(404);
    }); 
});

afterAll(async () => {
    await db.query('DELETE FROM users');
    await db.end();
});