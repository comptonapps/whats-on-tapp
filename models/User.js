const DB = require('../helpers/DB');
const { 
    DB_TABLES,
    BCRYPT_WORK_FACTOR 
} = require('../constants');
const bcrypt = require('bcrypt');

class User {
    static async create(data) {
        const password = await bcrypt.hash(data.password, +BCRYPT_WORK_FACTOR);
        const user = await DB.create(DB_TABLES.USERS, {...data, password});
        delete user.password;
        return user;
    };

    static async get() {
        return await DB.getRecords(DB_TABLES.USERS);
    };

    static async getById(id) {
        return await DB.getRecord(DB_TABLES.USERS, {id});
    }

    static async update(id, data) {
        return DB.updateRecord(DB_TABLES.USERS, data, {id});
    };

    static async delete(id) {
        await DB.deleteRecord(DB_TABLES.USERS, {id});
    }
};

module.exports = User;