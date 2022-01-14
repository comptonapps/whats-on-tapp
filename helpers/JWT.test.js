process.env.NODE_ENV='test';
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const SECRET = process.env.JWT_SECRET;
const JWT = require('./JWT');
const jwt = require('jsonwebtoken');
let token;

beforeAll(() => {
    token = JWT.getJWT({payload: {
        first: 'first',
        second: 'second'
    }});
});

describe('getJWT method', () => {
    test('it should return a jwt', () => {
        const data = {
            first: 'first',
            second: 'second'
        };
        const token = JWT.getJWT(data);
        const payload = jwt.verify(token, SECRET);
        expect(token).toEqual(expect.any(String));
        expect(payload.first).toEqual('first');
        expect(payload.second).toEqual('second');
    });

    test('it should validate a JWT and return payload', () => {
        const payload = JWT.validateJWT(token);
        expect(payload.payload.first).toEqual('first');
        expect(payload.payload.second).toEqual('second');
    });
});