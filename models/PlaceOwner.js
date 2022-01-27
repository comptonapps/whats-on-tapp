const DB = require('../helpers/DB');
const { 
    RecordNotFoundError
} = require('../expressError');
const { DB_TABLES } = require('../constants');

class PlaceOwners {
    static async createRelationship(user_id, place_id) {
        return await DB.create(DB_TABLES.PLACE_OWNERS, {user_id, place_id})
    };

    static async getByIds(user_id, place_id) {
        return await DB.getRecord(DB_TABLES.PLACE_OWNERS, {user_id, place_id});
    };

    static async delete(user_id, place_id) {
        await DB.deleteRecord(DB_TABLES.PLACE_OWNERS, {user_id, place_id});
    };
};

module.exports = PlaceOwners;