const { DB_TABLES } = require('../constants');
const DB = require('../helpers/DB');

class Place {
    static async create(data) {
        return await DB.create(DB_TABLES.PLACES, data);
    }

    static async get() {
        return await DB.getRecords(DB_TABLES.PLACES);
    };

    static async getById(id) {
        return await DB.getRecord(DB_TABLES.PLACES, { id });
    };

    static async update(id, data) {
        return await DB.updateRecord(DB_TABLES.PLACES, data, {id});
    }

    static async delete(id) {
        await DB.deleteRecord(DB_TABLES.PLACES, {id});
    }
};

module.exports = Place;