const DB = require('../helpers/DB');
const { DB_TABLES } = require('../constants');
const PLACE_RATINGS = DB_TABLES.PLACE_RATINGS

class PlaceRating {
    static async create(user_id, place_id, rating) {
        return await DB.create(PLACE_RATINGS, {user_id, place_id, rating});
    };

    static async get() {
        return await DB.getRecords(PLACE_RATINGS);
    };

    static async getRating(user_id, place_id) {
        return await DB.getRecord(PLACE_RATINGS, {user_id, place_id});
    }

    static async getByPlaceId(place_id) {
        return await DB.getRecords(PLACE_RATINGS, {place_id});
    };

    static async getByUserId(user_id) {
        return await DB.getRecords(PLACE_RATINGS, {user_id});
    };

    static async update(user_id, place_id, rating) {
        return await DB.updateRecord(PLACE_RATINGS, {rating}, {user_id, place_id});
    };

    static async delete(user_id, place_id) {
        await DB.deleteRecord(PLACE_RATINGS, {user_id, place_id});
    };
};

module.exports = PlaceRating;