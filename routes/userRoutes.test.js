process.env.NODE_ENV='test';
const request = require('supertest');
const app = require('../app');
const db = require('../db');

beforeAll(async () => {

});

describe('', () => {
    test('', async () => {
        expect(1).toEqual(1);
    })
})

afterAll(async () => {
    await db.end();
});