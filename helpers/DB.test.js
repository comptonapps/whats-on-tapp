process.env.NODE_ENV='test';
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const db = require('../db');
const DB = require('./DB');

describe('getCreateStringAndVariables method', () => {
    test('it should return a dynamic variable POSTGRES string and an array of variables', () => {
        const [str, vars] = DB.getCreateStringAndVariables('users', {username: 'testuser', email: "j@c.com"});
        expect(str).toEqual('INSERT INTO users (username,email) VALUES ($1,$2) RETURNING *');
        expect(vars).toEqual(['testuser', 'j@c.com']);
    })
});

describe('DB.create method', () => {
    test('it should create and return a user', async () => {
        const newUserData = {
            username: 'testuser',
            password: 'secret',
            email: 'test@tester.com',
            city: 'Seattle',
            state: 'WA'
        }
        const user = await DB.create('users', newUserData);
        expect(user.id).toEqual(expect.any(Number));
        expect(user.username).toEqual(newUserData.username);
        expect(user.password).toEqual(expect.any(String));
        expect(user.email).toEqual(newUserData.email);
        expect(user.city).toEqual(newUserData.city);
        expect(user.state).toEqual(newUserData.state);
    });
});

describe('getUpdateStringAndVariables method', () => {
    test('it should return a dynamic string to update a record and an array of variables', () => {
        const [str, vars] = DB.getUpdateStringAndVariables('users', {username: 'newname'}, {id: 3});
        expect(str).toEqual('UPDATE users SET username=$1 WHERE id=$2 RETURNING *');
        expect(vars).toEqual(['newname', 3]);
    })
})

describe('DB.update method', () => {

});

describe('DB.getDeleteStringAndVariables method', () => {
    test('it should return a dynamic string for deleting a record and an array of variables', () => {
        const [str, vars] = DB.getDeleteStringAndVariables('drinks', {id: 5});
        expect(str).toEqual('DELETE FROM drinks WHERE id=$1 RETURNING *');
        expect(vars).toEqual([5]);
    })
})

afterAll(async () => {
    await db.query('DELETE FROM users');
    db.end();
});

