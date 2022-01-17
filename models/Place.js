const { DB_TABLES } = require('../constants');
const DB = require('../helpers/DB');

class Place {
    static async create(data) {
        return await DB.create(DB_TABLES.PLACES, data);
    }
};

module.exports = Place;