const DB = require('../helpers/DB');
const { DB_TABLES } = require('../constants');

class Drink {
    static async create(data) {
        return await DB.create(DB_TABLES.DRINKS, data);
    };

    static async get() {
        const drinks = await DB.getRecords(DB_TABLES.DRINKS);
        return drinks;
    };

    static async getById(id) {
        return await DB.getRecord(DB_TABLES.DRINKS, {id});
    };

    static async update(id, data) {
        return await DB.updateRecord(DB_TABLES.DRINKS, data, {id});
    };

    static async delete(id) {
        await DB.deleteRecord(DB_TABLES.DRINKS, {id});
    };
};

module.exports = Drink;