const db = require('../db');
const bcrypt = require('bcrypt');
const { BadRequestError } = require('../expressError');

async function authenticateUser(username, password) {
    const result = await db.query('SELECT * FROM users WHERE username=$1', [username]);
    const user = result.rows[0];
    if (user) {
        const match = await bcrypt.compare(password, user.password);
        if (match) {
            delete user.password;
            return user;
        }
    }
    throw new BadRequestError("Invalid username or password");
};

module.exports = authenticateUser;