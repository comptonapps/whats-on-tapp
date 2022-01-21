process.env.NODE_ENV='test';
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const SECRET = process.env.JWT_SECRET;
const request = require('supertest');
const app = require('../app');
const db = require('../db');
const Drink = require('../models/Drink');
const jwt = require('jsonwebtoken');

let token;
let adminToken;
let d1;
let d2;

beforeAll(async () => {

    const fakeUser = {
        id: 667,
        username: "fu667",
        is_admin: false
    };

    const fakeAdmin = {
        id: 122,
        username: "admin",
        is_admin: true
    }

    token = jwt.sign(fakeUser, SECRET);
    adminToken = jwt.sign(fakeAdmin, SECRET);
    
    const d1data = {
        name: "Foul Ball Ale",
        maker: "Triple Play Brewing"
    };

    const d2data = {
        name: "Cascade Pale Ale",
        maker: "PNW Brewing Co."
    };  

    d1 = await Drink.create(d1data);
    d2 = await Drink.create(d2data);
    d1.created_at = d1.created_at.toISOString();
    d1.updated_at = d1.updated_at.toISOString();
    d2.created_at = d2.created_at.toISOString();
    d2.updated_at = d2.updated_at.toISOString();
});

describe('GET /drink', () => {
    test('it should return an array of drinks for an authenticated user', async () => {
        const response = await request(app).get('/drink').set('authorization', `Bearer ${token}`);
        expect(response.status).toBe(200);
        expect(response.body.drinks).toHaveLength(2);
        expect(response.body.drinks).toEqual([d1, d2]);
    });

    test('it should respond with a 403 code for a non authenticated user', async () => {
        const response = await request(app).get('/drink');
        expect(response.status).toBe(403);
    });
});

describe('GET /drink/:id', () => {
    test('it should return data for a drink with matching id', async () => {
        const response = await request(app).get(`/drink/${d1.id}`).set('authorization', `Bearer ${token}`);
        const { drink } = response.body;
        expect(drink).toEqual(d1);
    });

    test('it should respond with an error message and 404 code for a non-existent drink', async () => {
        const response = await request(app).get(`/drink/0`).set('authorization', `Bearer ${token}`);
        expect(response.status).toBe(404);
        expect(response.body.message).toEqual('Record not found in drinks');
    });

    test('it should respond with an error message and 403 code for a non authenticated user', async () => {
        const response = await request(app).get(`/drink/0`);
        expect(response.status).toBe(403);
        expect(response.body.message).toEqual('Authentication required');
    });

    
});

describe('POST /drink', () => {
    const newDrinkData = {
        name: 'Index Zero Pale',
        maker: 'Bit Brewing, Inc'
    };

    test('it should respond with a 403 code for a non admin user', async () => {
        const response = await request(app).post('/drink').set('authorization', `Bearer ${token}`).send(newDrinkData);
        expect(response.status).toBe(403);
    });

    test('it should respond with a 403 code for a non-authenticated user', async () => {
        const response = await request(app).post('/drink')
        expect(response.status).toBe(403);
    });

    test('it should create a drink and return drink data for an admin request', async () => {
        const response = await request(app).post('/drink').set('authorization', `Bearer ${adminToken}`).send(newDrinkData);
        const drink = response.body.drink;
        expect(response.status).toBe(201);
        expect(drink.id).toEqual(expect.any(Number));
        expect(drink.name).toEqual(newDrinkData.name);
        expect(drink.maker).toEqual(newDrinkData.maker);
    });

    test('it should return with a 400 response code for missing drink data', async () => {
        const response = await request(app).post('/drink').set('authorization', `Bearer ${adminToken}`).send({name: 'Error Saison'});
        expect(response.status).toBe(400);
    });

    test('it should return with a 400 response code for extra fields in drink data', async () => {
        const response = await request(app).post('/drink').set('authorization', `Bearer ${adminToken}`).send({name: 'Error Saison', maker: 'foo brews', fake: 'blargh'});
        expect(response.status).toBe(400);
    });
});

describe('PATCH /drink', () => {
    const newDrinkData = {
        name: 'Beer 2.0',
        maker: 'Schutzpah Brewing',
        abv: '6.6',
        untappd_id: "55555"
    };
    test('it should respond with a 403 error code for a non-admin user', async () => {
        const response = await request(app).patch(`/drink/${d1.id}`).set('authorization', `Bearer ${token}`).send(newDrinkData);
        expect(response.status).toEqual(403);
    });

    test('it should respond with a 403 error code for a non-authenticated user', async () => {
        const response = await request(app).patch(`/drink/${d1.id}`).send(newDrinkData);
        expect(response.status).toEqual(403);
    });

    test('it should respond with a 400 status for extra fields in drink data', async () => {
        const response = await request(app).patch(`/drink/${d1.id}`).set('authorization', `Bearer ${adminToken}`).send({...newDrinkData, error: 'baz'});
        expect(response.status).toBe(400);
    });

    test('it should update a drink and return the new data for admin request', async () => {
        const response = await request(app).patch(`/drink/${d1.id}`).set('authorization', `Bearer ${adminToken}`).send(newDrinkData);
        expect(response.status).toEqual(200);
        const drink = response.body.drink;
        expect(drink.untappd_id).toEqual(newDrinkData.untappd_id);
        expect(drink.abv).toEqual(newDrinkData.abv);
        expect(drink.name).toEqual(newDrinkData.name);
        expect(drink.maker).toEqual(newDrinkData.maker);
        expect(drink.updated_at).not.toEqual(d1.updated_at);
    });

    test('it should return with an error message and a 404 code for a non-existent drink', async () => {
        const response = await request(app).patch(`/drink/0`).set('authorization', `Bearer ${adminToken}`).send(newDrinkData);
        expect(response.status).toEqual(404);
        expect(response.body.message).toEqual('Record not found in drinks');
    })
});

describe('DELETE /drink/:id', () => {
    test('it should return a 403 error code for a non authenticated user', async () => { 
        const response = await request(app).delete(`/drink/${d1.id}`);
        expect(response.status).toBe(403);
    });

    test('it should return a 403 error code for a non-admin user', async () => { 
        const response = await request(app).delete(`/drink/${d1.id}`).set('authorization', `Bearer ${token}`);
        expect(response.status).toBe(403);
    });

    test('it should delete a drink and return a deleted message', async () => { 
        const response = await request(app).delete(`/drink/${d1.id}`).set('authorization', `Bearer ${adminToken}`);
        expect(response.status).toBe(200);
        expect(response.body.message).toBe('deleted');
    });

    test('it should return a 404 error code for a non-existent drink', async () => { 
        const response = await request(app).delete(`/drink/${d1.id}`).set('authorization', `Bearer ${adminToken}`);
        expect(response.status).toBe(404);
        expect(response.body.message).toEqual('Record not found in drinks');
    });
});

afterAll(async () => {
    await db.query('DELETE FROM drinks');
    await db.end();
});