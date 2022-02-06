const { 
    DB_TABLES,
    PLACES_SORT_OPTIONS
 } = require('../constants');
const DB = require('../helpers/DB');
const { ExpressError } = require('../expressError');

class Place {
    static async create(data) {
        return await DB.create(DB_TABLES.PLACES, data);
    }

    static async get(queryFilters=null) {
        if (!Object.keys(queryFilters).length) {
            return await DB.getRecords(DB_TABLES.PLACES);
        } else {
            let str = `SELECT places.*, AVG(rating) as rating
                       FROM places
                       LEFT JOIN place_ratings 
                       ON place_id=id`;
            let vars = [];

            if (queryFilters.city || queryFilters.state) {
                [str, vars] = this.addLocationToQuery(str, vars, queryFilters);
            };
            
            str += ' GROUP BY id';
            if (queryFilters.sort) {
                validateSortOption(queryFilters.sort, PLACES_SORT_OPTIONS);
                str += ` ORDER BY ${queryFilters.sort}`
            };

            if (queryFilters.asc === false) {
                str += ' DESC'
            };

            if (queryFilters.limit) {
                str = addPaginationToQuery(str, {page: queryFilters.page, limit: queryFilters.limit})
            }

            const results = await DB.query(str, vars);
            return results.rows;
        }
        //return await DB.getRecords(DB_TABLES.PLACES);
        
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

    static addLocationToQuery(str, vars, obj) {
        const { city, state } = obj;
        const location = {};
        if (city) {
            location.city = city;
        }
        if (state) {
            location.state = state;
        }
        str += ` WHERE `;
        str += Object.keys(location).map(k => {
            if (location[k]) {
                vars.push(location[k]);
                return `${k} ILIKE '%' || $${vars.length} || '%'`;
            }
            
        }).join(' AND ');
        return [str, vars];
    }
};

function validateSortOption(entry, options) {
    if (!Object.values(options).includes(entry)) {
        throw new ExpressError('sort parameter is not a valid option', 400);
    }
}

function addPaginationToQuery(str, { page=1, limit }) {
    return str += ` OFFSET ${(page-1)*limit} LIMIT ${limit}`;
}

module.exports = Place;