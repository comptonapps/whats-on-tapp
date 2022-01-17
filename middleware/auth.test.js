process.env.NODE_ENV='test';
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const { 
    authenticateJWT, 
    checkForCorrectUserOrAdmin,
    userIsAuthenticated
} = require('./auth');
const JWT = require('../helpers/JWT');
const { ExpressError } = require('../expressError')
let token;
let fakeUser = {
    id: 5,
    username: 'fakeuser1',
    password: 'fakerpwd',
    email: 'fakemail@faker.com',
    city: 'Portland',
    state: 'OR',
    is_admin: false
};

beforeAll(() => {
    token = JWT.getJWT(fakeUser);
});

describe('validateJWT testing', () => {
    test('it should add user data to res.locals', () => {
        const req = { body: {token}};
        const res = { locals: {} };
        const next = function(err) {
            expect(err).toBeFalsy();
        }
        authenticateJWT(req, res, next);
        expect(res.locals.user).toEqual({...fakeUser, iat: expect.any(Number)});
    });
});

describe('checkForCorrectUserOrAdmin testing', () => {
    test('it should pass an error in the next function for non-matching id', () => {
        expect.assertions(1);
        const req = { body: { token }, params: {user_id: 0}};
        const res = { locals: {user: fakeUser}};
        const next = function(err) {
            expect(err instanceof ExpressError).toBeTruthy();
        }
        checkForCorrectUserOrAdmin(req, res, next);
    });

    test('it should add a user to res.locals if id in params matches id from token', () => {
        expect.assertions(1);
        const req = { body: { token }, params: {user_id: fakeUser.id}};
        const res = { locals: {user: fakeUser}};
        const next = function(err) {
            expect(err).toBeFalsy();
        }
        checkForCorrectUserOrAdmin(req, res, next);
    });

    test('it should not pass error to next if res.locals.user.is_admin', () => {
        expect.assertions(1);
        const req = { body: { token }, params: { user_id: 0}};
        const res = { locals: { user: {...fakeUser, is_admin: true}}};
        const next = function(err) {
            expect(err).toBeFalsy();
        };
        checkForCorrectUserOrAdmin(req, res, next);
    });
});

describe('userIsAuthenticated tests', () => {
    test('it should pass an error for a non-authenticated user', () => {
        expect.assertions(1);
        const req = { body: { token }};
        const res = { locals: {}};
        const next = function(err) {
            expect(err).toBeTruthy();
        };
        userIsAuthenticated(req, res, next);
    });

    test('it should not pass an error for an authenticated user', () => {
        expect.assertions(1);
        const req = { body: { token }};
        const res = { locals: { user: fakeUser}};
        const next = function(err) {
            expect(err).toBeFalsy();
        };
        userIsAuthenticated(req, res, next);
    });
});
