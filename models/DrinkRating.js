const DB = require('../helpers/DB');
const {
    DB_TABLES
} = require('../constants');

class DrinkRating {
    static async create(user_id, drink_id, rating) {
        return await DB.create(DB_TABLES.DRINK_RATINGS, {user_id, drink_id, rating});
    };

    static async getByDrinkId(drink_id) {
        return await DB.getRecords(DB_TABLES.DRINK_RATINGS, {drink_id});
    };

    static async getByUserId(user_id) {
        return await DB.getRecords(DB_TABLES.DRINK_RATINGS, {user_id});
    }

    static async getRating(user_id, drink_id) {
        return await DB.getRecord(DB_TABLES.DRINK_RATINGS, {user_id, drink_id});
    }

    static async update(user_id, drink_id, rating) {
        return await DB.updateRecord(DB_TABLES.DRINK_RATINGS, {rating}, {user_id, drink_id});
    };

    static async delete(user_id, drink_id) {
        await DB.deleteRecord(DB_TABLES.DRINK_RATINGS, {user_id, drink_id});
    };
};

module.exports = DrinkRating;