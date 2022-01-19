process.env.NODE_ENV='test';
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const SECRET = process.env.JWT_SECRET;
const request = require('supertest');
const app = require('../app');
const db = require('../db');
const jwt = require('jsonwebtoken');
const Place = require('../models/Place');

let token;
let adminToken;
let p1;
let p2;

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

    const p1Data = {
        name: "The Old 5th Avenue",
        address: "8530 5th Ave NE",
        city: "Seattle",
        state: "WA",
        zip: "98115"
    };

    const p2Data = {
        name: "Reservoir Tavern",
        address: "8603 Roosevelt Way NE",
        city: "Seattle",
        state: "WA",
        zip: "98115",
        url: "http://www.therez.com",
        phone: "2067777777"
    };
    p1 = await Place.create(p1Data);
    p2 = await Place.create(p2Data);
    p1.created_at = p1.created_at.toString();
    p1.updated_at = `${p1.updated_at}`;
    p2.created_at = `${p2.created_at}`;
    p2.updated_at = `${p2.updated_at}`;

});

describe('GET /places', () => {
    test('it should return a list of places', async () => {
        const response = await request(app).get('/place').set('authorization', `Bearer ${token}`);
        expect(response.status).toEqual(200);
        expect(response.body.places).toHaveLength(2);
        expect(response.body.places[0].id).toEqual(p1.id);
        expect(response.body.places[0].name).toEqual(p1.name);
        expect(response.body.places[0].address).toEqual(p1.address);
        expect(response.body.places[0].city).toEqual(p1.city);
        expect(response.body.places[0].state).toEqual(p1.state);
        expect(response.body.places[1].id).toEqual(p2.id);

    });

    test('it should return a 403 error if there is no token', async () => {
        const response = await request(app).get('/place');
        expect(response.status).toBe(403); 
    });

    test('it should return with a 403 response with an invalid token', async () => {
        const response = await request(app).get('/place').set('authorization', `Bearer faketoken`);
        expect(response.status).toBe(403);
    });
});

describe('GET /place/:id', () => {
    test('it should return data for a matching place id', async () => {
        const response = await request(app).get(`/place/${p1.id}`).set('authorization', `Bearer ${token}`);
        expect(response.status).toBe(200);
        expect(response.body.place.id).toEqual(p1.id);
        expect(response.body.place.name).toEqual(p1.name);
    });

    test('it should return a 403 error if there is no token', async () => {
        const response = await request(app).get(`/place/${p1.id}`);
        expect(response.status).toBe(403); 
    });

    test('it should return with a 403 response with an invalid token', async () => {
        const response = await request(app).get(`/place/${p1.id}`).set('authorization', `Bearer faketoken`);
        expect(response.status).toBe(403);
    });
});

describe('POST /place', () => {
    test('it should return with a 403 status for a non admin token', async () => {
        const newPlaceData = {
            name: "Foo Bar",
            address: "10101 Binary Way",
            city: "Palo Alto",
            state: "CA", 
            zip: "30033"
        }
        const response = await request(app).post(`/place`).set('authorization', `Bearer ${token}`).send(newPlaceData);
        expect(response.status).toBe(403);
    });

    test('it should return with a 403 status for no token', async () => {
        const newPlaceData = {
            name: "Foo Bar",
            address: "10101 Binary Way",
            city: "Palo Alto",
            state: "CA", 
            zip: "30033"
        }
        const response = await request(app).post(`/place`).send(newPlaceData);
        expect(response.status).toBe(403);
    });

    test('it should create and return new place data with admin token', async () => {
        const newPlaceData = {
            name: "Foo Bar",
            address: "10101 Binary Way",
            city: "Palo Alto",
            state: "CA", 
            zip: "30033"
        }
        const response = await request(app).post(`/place`).set('authorization', `Bearer ${adminToken}`).send(newPlaceData);
        const place = response.body.place;
        expect(response.status).toBe(201);
        expect(place.name).toEqual(newPlaceData.name);
        expect(place.address).toEqual(newPlaceData.address);
        expect(place.zip).toEqual(newPlaceData.zip);      
    });

    test('it should return a 400 code for non-valid place data', async () => {
        const newPlaceData = {
            name: "Foo Bar12345678910111213141516171819202122",
            address: "10101 Binary Way",
            city: "",
            state: "C", 
            zip: "3003"
        }
        const response = await request(app).post(`/place`).set('authorization', `Bearer ${adminToken}`).send(newPlaceData);
        expect(response.status).toBe(400);
    });

    test('it should return a 400 code for missing data', async () => {
        const newPlaceData = {
            state: "WA"
        };
        const response = await request(app).post(`/place`).set('authorization', `Bearer ${adminToken}`).send(newPlaceData);
        expect(response.status).toBe(400);
    });

    test('it should reaturn a 400 code for extra data', async () => {
        const newPlaceData = {
            name: "Foo Bar",
            address: "10101 Binary Way",
            city: "Palo Alto",
            state: "CA", 
            zip: "30033",
            foobar: "baz"
        }
        const response = await request(app).post(`/place`).set('authorization', `Bearer ${adminToken}`).send(newPlaceData);
        const place = response.body.place;
        expect(response.status).toBe(400);
    });

    test('it should reaturn a 400 code for a bad uri/url', async () => {
        const newPlaceData = {
            name: "Foo Bar",
            address: "10101 Binary Way",
            city: "Palo Alto",
            state: "CA", 
            zip: "30033",
            url: "www.baz.com"
        }
        const response = await request(app).post(`/place`).set('authorization', `Bearer ${adminToken}`).send(newPlaceData);
        expect(response.status).toBe(400);
        expect(response.body.message).toEqual([ 'instance.url does not conform to the "uri" format' ]);
    });
});

describe('POST /place', () => {
    const updatedData = {
        name: "Gonad's Gully",
        address: "116 Elm Street",
        city: "Springwood",
        state: "OH",
        url: "http://www.gonads.com"
    };
    test('it should update place data for an admin', async () => {
        const response = await request(app).patch(`/place/${p1.id}`).set('authorization', `Bearer ${adminToken}`).send(updatedData);
        expect(response.status).toBe(200);
        const place = response.body.place;
        expect(place.id).toEqual(p1.id);
        expect(place.name).toEqual(updatedData.name);
        expect(place.address).toEqual(updatedData.address);
        expect(place.url).toEqual(updatedData.url);
    });

    test('it should return a 403 error code for a non-admin token', async () => {
        const response = await request(app).patch(`/place/${p1.id}`).set('authorization', `Bearer ${token}`).send(updatedData);
        expect(response.status).toBe(403);
    });

    test('it should return a 403 error code for a non authenticated user', async () => {
        const response = await request(app).patch(`/place/${p1.id}`).send(updatedData);
        expect(response.status).toBe(403);
    });
})

afterAll(async () => {
    await db.query('DELETE FROM places');
    await db.end();
});