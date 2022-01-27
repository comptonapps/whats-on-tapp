const {
    testBeforeAll,
    testBeforeEach,
    testAfterAll,
    testAfterEach,
    users,
    drinks,
    places,
    drinkRatings,
    placeRatings,
    placeOwners,
    tokens
} = require('../testSetup/setup');
const app = require('../app');
const request = require('supertest');

beforeAll(testBeforeAll);

beforeEach(testBeforeEach);

describe('GET /users', () => {
    test('it should return an array of users', async () => {
        const response = await request(app).get('/user').set('authorization', `Bearer ${tokens.user}`);
        expect(response.status).toBe(200);
        expect(response.body.users).toHaveLength(users.length);
        expect(response.body.users).toEqual(users);
    });

    test('it should return an array of users upon admin request', async () => {
        const response = await request(app).get('/user').set('authorization', `Bearer ${tokens.admin}`);
        expect(response.status).toBe(200);
        expect(response.body.users).toEqual(users);
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
        const response = await request(app).get(`/user/${users[0].id}`);
        expect(response.status).toBe(403);
        expect(response.body.message).toEqual('Authentication required');
    });

    test('it should return a 403 code and error message for a bad token request', async () => {
        const response = await request(app).get(`/user/${users[0].id}`).set('authorization', `Bearer badToken3.idgaf`);
        expect(response.status).toBe(403);
        expect(response.body.message).toEqual('Authentication required');
    });

    test('it should return a 404 error code for a request with a non-existent user id', async () => {
        const response = await request(app).get(`/user/0`).set('authorization', `Bearer ${tokens.user}`);
        expect(response.status).toBe(404);
        expect(response.body.message).toEqual('Record not found in users');
    });

    test('it should return user data for a request from an authenticated user', async () => {
        const response = await request(app).get(`/user/${users[0].id}`).set('authorization', `Bearer ${tokens.user}`);
        expect(response.status).toBe(200);
        expect(response.body.user).toEqual(users[0]);
    });
});

describe('GET /users/:user_id/rating/drink', () => {
    test('it should return an array of drink ratings', async () => {
        const response = await request(app).get(`/user/${users[0].id}/rating/drink`).set('authorization', `Bearer ${tokens.user}`);
        expect(response.status).toBe(200);
        const ratings = response.body.drink_ratings;
        expect(ratings).toHaveLength(1);
        expect(ratings).toEqual([drinkRatings[0]]);
    });
});

describe('GET /users/:user_id/rating/place', () => {
    test('it should return an array of place ratings', async () => {
        const response = await request(app).get(`/user/${users[0].id}/rating/place`).set('authorization', `Bearer ${tokens.user}`);
        expect(response.status).toBe(200);
        const ratings = response.body.place_ratings;
        expect(ratings).toHaveLength(2);
        expect(ratings).toEqual(placeRatings);
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
        const response = await request(app).post(`/user/${users[0].id}/place`).set('authorization', `Bearer ${tokens.user}`).send(placeData);
        expect(response.status).toBe(201);
        place = response.body.place;
        const { place_owner } = response.body;
        expect(place.id).toEqual(expect.any(Number));
        expect(place.name).toEqual(placeData.name);
        expect(place_owner.user_id).toEqual(users[0].id);
        expect(place_owner.place_id).toEqual(place.id);
    });
});

describe('POST /users/:user_id/rating/drink/:drink_id', () => {
    test('it should create a drink rating and return the data', async () => {
        const response = await request(app).post(`/user/${users[0].id}/rating/drink/${drinks[1].id}`)
                            .set('authorization', `Bearer ${tokens.user}`)
                            .send({rating: 5});
        expect(response.status).toBe(201);
        const { drink_rating } = response.body;
        expect(drink_rating.user_id).toEqual(users[0].id);
        expect(drink_rating.drink_id).toEqual(drinks[1].id);
        expect(drink_rating.rating).toEqual(5);
    });

    test('it should return a 404 error code and message for a drink that does not exist', async () => {
        const response = await request(app).post(`/user/${users[0].id}/rating/drink/0`)
                            .set('authorization', `Bearer ${tokens.user}`)
                            .send({rating: 5});
        expect(response.status).toBe(404);
        expect(response.body.message).toEqual('Record not found in drinks');
    });

    test('it should return a 400 error code and DataCollisionError message for a rating that is already created', async () => {
        const response = await request(app).post(`/user/${users[0].id}/rating/drink/${drinks[0].id}`)
                            .set('authorization', `Bearer ${tokens.user}`)
                            .send({rating: 5});
        expect(response.status).toBe(400);
        expect(response.body.message).toEqual('Duplicate record already exists');
    });
});

describe('POST /users/:user_id/rating/place/:place_id', () => {
    test('it should create a place rating and return the data', async () => {
        const response = await request(app).post(`/user/${users[1].id}/rating/place/${places[0].id}`)
            .set('authorization', `Bearer ${tokens.admin}`)
            .send({rating: 4});
        expect(response.status).toBe(201);
        const { place_rating } = response.body;
        expect(place_rating.user_id).toEqual(users[1].id);
        expect(place_rating.place_id).toEqual(places[0].id);
        expect(place_rating.rating).toEqual(4);
    });
    
    test('it should return a 404 error code and message for a place that does not exist', async () => {
        const response = await request(app).post(`/user/${users[0].id}/rating/place/0`)
            .set('authorization', `Bearer ${tokens.user}`)
            .send({rating: 4});
        expect(response.status).toBe(404);
        expect(response.body.message).toEqual('Record not found in places');
    });

    test('it should return a 400 error code and DataCollisionError for a rating that is already created', async () => {
        const response = await request(app).post(`/user/${users[0].id}/rating/place/${places[0].id}`)
            .set('authorization', `Bearer ${tokens.user}`)
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
        const response = await request(app).patch(`/user/${users[0].id}`).send(updateData);
        expect(response.status).toBe(403);
        expect(response.body.message).toEqual('Unauthorized user');
    });

    test('it should return a 403 error code and message for a bad token request', async () => {
        const response = await request(app).patch(`/user/${users[0].id}`).set('authorization', `Bearer badtoken`).send(updateData);
        expect(response.status).toBe(403);
        expect(response.body.message).toEqual('Unauthorized user');
    });

    test('it should respond with a 404 error code and message for a user id that is non-existent (admin request)', async () => {
        const response = await request(app).patch(`/user/0`).set('authorization', `Bearer ${tokens.admin}`).send(updateData);
        expect(response.status).toBe(404);
        expect(response.body.message).toEqual('Record not found in users');
    });

    test('it should respond with a 403 error code and message for a non matching token id and user id to be updated', async () => {
        const response = await request(app).patch(`/user/${users[1].id}`).set('authorization', `Bearer ${tokens.user}`).send(updateData);
        expect(response.status).toBe(403);
    });

    test('it should respond with a 400 error code for extra fields in the update data object', async () => {
        const response = await request(app).patch(`/user/${users[0].id}`).set('authorization', `Bearer ${tokens.user}`).send({...updateData, foo: 'bar'});
        expect(response.status).toBe(400);
    });

    test('it should update a user and return the user data for an authenticated user with a matching id', async () => {
        const response = await request(app).patch(`/user/${users[0].id}`).set('authorization', `Bearer ${tokens.user}`).send(updateData);
        expect(response.status).toBe(200);
        const updatedUser = response.body.user;
        expect(updatedUser.id).toEqual(users[0].id);
        expect(updatedUser.email).toEqual(updateData.email);
        expect(updatedUser.city).toEqual(updateData.city);
        expect(updatedUser.state).toEqual(updateData.state);
    });
});

describe('PATCH /user/:user_id/rating/drink/:drink_id', () => {
    test('it should update a drink rating and return the data', async () => {
        const updatedRating = 1;
        const response = await request(app).patch(`/user/${users[0].id}/rating/drink/${drinks[0].id}`)
            .set('authorization', `Bearer ${tokens.user}`)
            .send({rating: updatedRating});
        expect(response.status).toBe(200);
        expect(response.body.drink_rating.rating).toBe(1);
    });

    test('it should return a 404 error code for a non-existent rating', async () => {
        const updatedRating = 1;
        const response = await request(app).patch(`/user/${users[0].id}/rating/drink/0`)
            .set('authorization', `Bearer ${tokens.user}`)
            .send({rating: updatedRating});
        expect(response.status).toBe(404);
    });
});

describe('PATCH /user/:user_id/rating/place/:place_id', () => {
    test('it should update a place rating and return the data', async () => {
        const updatedRating = 1;
        const response = await request(app).patch(`/user/${users[0].id}/rating/place/${places[0].id}`)
            .set('authorization', `Bearer ${tokens.user}`)
            .send({rating: updatedRating});
        expect(response.status).toBe(200);
        expect(response.body.place_rating.rating).toBe(1);
    });

    test('it should return a 404 error code for a non-existent rating', async () => {
        const updatedRating = 1;
        const response = await request(app).patch(`/user/${users[0].id}/rating/place/0`)
            .set('authorization', `Bearer ${tokens.user}`)
            .send({rating: updatedRating});
        expect(response.status).toBe(404);
    });
});

describe('DELETE /users/:user_id', () => {
    test('it should respond with a 403 error code and message for a non-authenticated user', async () => {
        const response = await request(app).delete(`/user/${users[0].id}`);
        expect(response.status).toBe(403);
        expect(response.body.message).toEqual('Unauthorized user');
    });

    test('it shuold respond with a 403 error code and message for a bad token request', async () => {
        const response = await request(app).delete(`/user/${users[0].id}`).set('authorization', `Bearer foobar`);
        expect(response.status).toBe(403);
        expect(response.body.message).toEqual('Unauthorized user');
    });

    test('it should delete a user for an admin token request', async () => {
        const response = await request(app).delete(`/user/${users[2].id}`).set('authorization', `Bearer ${tokens.admin}`);
        expect(response.status).toBe(200);
        const check = await request(app).get(`/user/${users[2].id}`).set('authorization', `Bearer ${tokens.admin}`);
        expect(check.status).toBe(404);
    });

    test('it should delete a user with a token id that matches the route id', async () => {
        const response = await request(app).delete(`/user/${users[0].id}`).set('authorization', `Bearer ${tokens.user}`);
        expect(response.status).toBe(200);
        const check = await request(app).get(`/user/${users[0].id}`).set('authorization', `Bearer ${tokens.admin}`);
        expect(check.status).toBe(404);
    });
    
    test('it should respond with a 404 error code for a non-existent user', async () => {
        const response = await request(app).delete(`/user/0`).set('authorization', `Bearer ${tokens.admin}`);
        expect(response.status).toBe(404);
    }); 
});


afterEach(testAfterEach);

afterAll(testAfterAll);

