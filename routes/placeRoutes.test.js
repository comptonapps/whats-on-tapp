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

describe('GET /places', () => {
    test('it should return a list of places', async () => {
        const response = await request(app).get('/place').set('authorization', `Bearer ${tokens.user}`);
        expect(response.status).toEqual(200);
        expect(response.body.places).toHaveLength(places.length);
        expect(response.body.places).toEqual(places);
        expect(response.body.places[0].id).toEqual(places[0].id);
        expect(response.body.places[0].name).toEqual(places[0].name);
        expect(response.body.places[1].id).toEqual(places[1].id);

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
        const response = await request(app).get(`/place/${places[0].id}`).set('authorization', `Bearer ${tokens.user}`);
        expect(response.status).toBe(200);
        expect(response.body.place).toEqual(places[0]);
    });

    test('it should return a 403 error if there is no token', async () => {
        const response = await request(app).get(`/place/${places[0].id}`);
        expect(response.status).toBe(403); 
    });

    test('it should return with a 403 response with an invalid token', async () => {
        const response = await request(app).get(`/place/${places[0].id}`).set('authorization', `Bearer faketoken`);
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
        const response = await request(app).post(`/place`).set('authorization', `Bearer ${tokens.user}`).send(newPlaceData);
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
        const response = await request(app).post(`/place`).set('authorization', `Bearer ${tokens.admin}`).send(newPlaceData);
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
        const response = await request(app).post(`/place`).set('authorization', `Bearer ${tokens.admin}`).send(newPlaceData);
        expect(response.status).toBe(400);
    });

    test('it should return a 400 code for missing data', async () => {
        const newPlaceData = {
            state: "WA"
        };
        const response = await request(app).post(`/place`).set('authorization', `Bearer ${tokens.admin}`).send(newPlaceData);
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
        const response = await request(app).post(`/place`).set('authorization', `Bearer ${tokens.admin}`).send(newPlaceData);
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
        const response = await request(app).post(`/place`).set('authorization', `Bearer ${tokens.admin}`).send(newPlaceData);
        expect(response.status).toBe(400);
        expect(response.body.message).toEqual([ 'instance.url does not conform to the "uri" format' ]);
    });
});

describe('PATCH /place', () => {
    const updatedData = {
        name: "Gonad's Gully",
        address: "116 Elm Street",
        city: "Springwood",
        state: "OH",
        url: "http://www.gonads.com"
    };
    test('it should update place data for an admin', async () => {
        const response = await request(app).patch(`/place/${places[0].id}`).set('authorization', `Bearer ${tokens.admin}`).send(updatedData);
        expect(response.status).toBe(200);
        const place = response.body.place;
        expect(place.id).toEqual(places[0].id);
        expect(place.name).toEqual(updatedData.name);
        expect(place.address).toEqual(updatedData.address);
        expect(place.url).toEqual(updatedData.url);
        expect(place.updated_at).not.toEqual(places[0].updated_at)
    });

    test('it should return a 403 error code for a non-admin token', async () => {
        const response = await request(app).patch(`/place/${places[0].id}`).set('authorization', `Bearer ${tokens.user}`).send(updatedData);
        expect(response.status).toBe(403);
    });

    test('it should return a 403 error code for a non authenticated user', async () => {
        const response = await request(app).patch(`/place/${places[0].id}`).send(updatedData);
        expect(response.status).toBe(403);
    });
});

describe('/DELETE /place/:id', () => {
    test('it should delete a place and return a deleted message with an admin token', async () => {
        const response = await request(app).delete(`/place/${places[0].id}`).set('authorization', `Bearer ${tokens.admin}`);
        expect(response.status).toBe(200);
        expect(response.body.message).toEqual("deleted");
    });

    test('it should return a 404 code for a non-existent place', async () => {
        const response = await request(app).delete(`/place/0`).set('authorization', `Bearer ${tokens.admin}`);
        expect(response.status).toBe(404);
    });

    test('it should return a 403 error code for a non-admin token', async () => {
        const response = await request(app).delete(`/place/${places[1].id}`).set('authorization', `Bearer ${tokens.user}`);
    });

    test('it should return a 403 error code for a non authenticated user', async () => {
        const response = await request(app).delete(`/place/${places[1].id}`);
        expect(response.status).toBe(403);
    });
});



afterEach(testAfterEach);

afterAll(testAfterAll);