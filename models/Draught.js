const { DB_TABLES } = require('../constants');
const DRAUGHTS = DB_TABLES.DRAUGHTS;
const DB = require('../helpers/DB');

class Draughts {
    static async create(data) {
        return await DB.create(DRAUGHTS, data);
    };

    static async get() {
        return await DB.getRecords(DRAUGHTS);
    };

    static async getByPlaceId(place_id) {
        return await DB.getRecords(DRAUGHTS, {place_id});
    };

    static async getByDrinkId(drink_id) {
        return await DB.getRecords(DRAUGHTS, {drink_id});
    };

    static async getDraught(drink_id, place_id) {
        return await DB.getRecord(DRAUGHTS, {drink_id, place_id})
    };

    static async update(drink_id, place_id, active) {
        return await DB.updateRecord(DRAUGHTS, {active}, {drink_id, place_id});
    };

    static async delete(drink_id, place_id) {
        await DB.deleteRecord(DRAUGHTS, {drink_id, place_id})
    };
};

module.exports = Draughts;