const DB = require('../helpers/DB');
const { 
    DB_TABLES,
    BCRYPT_WORK_FACTOR 
} = require('../constants');
const bcrypt = require('bcrypt');

class User {
    static async create(data) {
        data.password = await bcrypt.hash(data.password, BCRYPT_WORK_FACTOR);
        const user = await DB.create(DB_TABLES.USERS, data);
        delete user.password;
        return user;
    }
};

module.exports = User;