process.env.NODE_ENV='test';
const request = require('supertest');
const app = require('../app');
const db = require('../db');
const User = require('../models/User');
const JWT = require('../helpers/JWT');
const Drink = require('../models/Drink');
const Place = require('../models/Place');
const PlaceRating = require('../models/PlaceRating');
const DrinkRating = require('../models/DrinkRating');
const { DataCollisionError } = require('../expressError')

let u1;
let u2;

let drink;
let drink2;

let place;
let place2;
let place3;

let dr1;
let dr2;

let pr1;
let pr2;

let token;
let adminToken;

// TODO: test get ratings routes for drinks and places

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

    drink = await Drink.create({name: 'middleman ale', maker: 'test ales, co'});
    drink2 = await Drink.create({name: 'one eyed jack', maker: '52 pick up brewery'});

    place2 = await Place.create({
        name: 'Donna\'s Diner',
        address: '456 Oak Avenue',
        city: 'Detroit',
        state: 'MI',
        zip: '87654'
    });

    place3 = await Place.create({
        name: 'Don\'s Pub',
        address: '456 Pine Avenue',
        city: 'Madison',
        state: 'WI',
        zip: '80654'
    });

    pr1 = await PlaceRating.create(u2.id, place3.id, 4);
    pr2 = await PlaceRating.create(u2.id, place2.id, 3);
    pr1.created_at = pr1.created_at.toISOString();
    pr1.updated_at = pr1.updated_at.toISOString();
    pr2.created_at = pr2.created_at.toISOString();
    pr2.updated_at = pr2.updated_at.toISOString();

    dr1 = await DrinkRating.create(u2.id, drink.id, 5);
    dr2 = await DrinkRating.create(u2.id, drink2.id, 1);
    dr1.created_at = dr1.created_at.toISOString();
    dr1.updated_at = dr1.updated_at.toISOString();
    dr2.created_at = dr2.created_at.toISOString();
    dr2.updated_at = dr2.updated_at.toISOString();

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

describe('GET /users/:user_id/rating/drink', () => {
    test('it should return an array of drink ratings', async () => {
        const response = await request(app).get(`/user/${u2.id}/rating/drink`).set('authorization', `Bearer ${token}`);
        expect(response.status).toBe(200);
        const ratings = response.body.drink_ratings;
        expect(ratings).toHaveLength(2);
        expect(ratings).toEqual([dr1, dr2]);
    });
});

describe('GET /users/:user_id/rating/place', () => {
    test('it should return an array of place ratings', async () => {
        const response = await request(app).get(`/user/${u2.id}/rating/place`).set('authorization', `Bearer ${token}`);
        expect(response.status).toBe(200);
        const ratings = response.body.place_ratings;
        expect(ratings).toHaveLength(2);
        expect(ratings).toEqual([pr1, pr2]);
    })
});

describe('POST /users/:user_id/place', () => {
    const placeData = {
        name: 'Rita\'s', 
        address: '123 Oak Ave', 
        city: 'Seattle', 
        state: 'WA', 
        zip: '98122'
    }
    test('it should create a place and a place_owner relationship and return the data', async () => {
        const response = await request(app).post(`/user/${u1.id}/place`).set('authorization', `Bearer ${token}`).send(placeData);
        expect(response.status).toBe(201);
        place = response.body.place;
        const { place_owner } = response.body;
        expect(place.id).toEqual(expect.any(Number));
        expect(place.name).toEqual(placeData.name);
        expect(place_owner.user_id).toEqual(u1.id);
        expect(place_owner.place_id).toEqual(place.id);
    });
});

describe('POST /users/:user_id/rating/drink/:drink_id', () => {
    test('it should create a drink rating and return the data', async () => {
        const response = await request(app).post(`/user/${u1.id}/rating/drink/${drink.id}`)
                            .set('authorization', `Bearer ${token}`)
                            .send({rating: 5});
        expect(response.status).toBe(201);
        const { drink_rating } = response.body;
        expect(drink_rating.user_id).toEqual(u1.id);
        expect(drink_rating.drink_id).toEqual(drink.id);
        expect(drink_rating.rating).toEqual(5);
    });

    test('it should return a 404 error code and message for a drink that does not exist', async () => {
        const response = await request(app).post(`/user/${u1.id}/rating/drink/0`)
                            .set('authorization', `Bearer ${token}`)
                            .send({rating: 5});
        expect(response.status).toBe(404);
        expect(response.body.message).toEqual('Record not found in drinks');
    });

    test('it should return a 400 error code and DataCollisionError message for a rating that is already created', async () => {
        const response = await request(app).post(`/user/${u1.id}/rating/drink/${drink.id}`)
            .set('authorization', `Bearer ${token}`)
            .send({rating: 4});
        expect(response.status).toBe(400);
        expect(response.body.message).toEqual('Duplicate record already exists');
    });
});

describe('POST /users/:user_id/rating/place/:place_id', () => {
    test('it should create a place rating and return the data', async () => {
        const response = await request(app).post(`/user/${u1.id}/rating/place/${place.id}`)
            .set('authorization', `Bearer ${token}`)
            .send({rating: 4});
        expect(response.status).toBe(201);
        const { place_rating } = response.body;
        expect(place_rating.user_id).toEqual(u1.id);
        expect(place_rating.place_id).toEqual(place.id);
        expect(place_rating.rating).toEqual(4);
    });
    
    test('it should return a 404 error code and message for a place that does not exist', async () => {
        const response = await request(app).post(`/user/${u1.id}/rating/place/0`)
            .set('authorization', `Bearer ${token}`)
            .send({rating: 4});
        expect(response.status).toBe(404);
        expect(response.body.message).toEqual('Record not found in places');
    });

    test('it should return a 400 error code and DataCollisionError for a rating that is already created', async () => {
        const response = await request(app).post(`/user/${u1.id}/rating/place/${place.id}`)
            .set('authorization', `Bearer ${token}`)
            .send({rating: 4});
        expect(response.status).toBe(400);
        expect(response.body.message).toEqual('Duplicate record already exists');
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

describe('PATCH /user/:user_id/rating/drink/:drink_id', () => {
    test('it should update a drink rating and return the data', async () => {
        const updatedRating = 1;
        const response = await request(app).patch(`/user/${u1.id}/rating/drink/${drink.id}`)
            .set('authorization', `Bearer ${token}`)
            .send({rating: updatedRating});
        expect(response.status).toBe(200);
        expect(response.body.drink_rating.rating).toBe(1);
    });

    test('it should return a 404 error code for a non-existent rating', async () => {
        const updatedRating = 1;
        const response = await request(app).patch(`/user/${u1.id}/rating/drink/0`)
            .set('authorization', `Bearer ${token}`)
            .send({rating: updatedRating});
        expect(response.status).toBe(404);
    });
});

describe('PATCH /user/:user_id/rating/place/:place_id', () => {
    test('it should update a place rating and return the data', async () => {
        const updatedRating = 1;
        const response = await request(app).patch(`/user/${u1.id}/rating/place/${place.id}`)
            .set('authorization', `Bearer ${token}`)
            .send({rating: updatedRating});
        expect(response.status).toBe(200);
        expect(response.body.place_rating.rating).toBe(1);
    });

    test('it should return a 404 error code for a non-existent rating', async () => {
        const updatedRating = 1;
        const response = await request(app).patch(`/user/${u1.id}/rating/place/0`)
            .set('authorization', `Bearer ${token}`)
            .send({rating: updatedRating});
        expect(response.status).toBe(404);
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
    await db.query('DELETE FROM places');
    await db.query('DELETE FROM drinks');
    await db.end();
});