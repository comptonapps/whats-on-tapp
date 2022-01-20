const db = require('../db');
const {
    ExpressError,
    RecordNotFoundError,
    DataCollisionError
} = require('../expressError');

const { DB_TABLES } = require('../constants');

class DB {
    static async create(table, data) {
        const [str, variables] = this.getCreateStringAndVariables(table, data);
        try {
            const results = await db.query(str, variables);
            return results.rows[0];
        } catch(e) {
            if (e.code && e.code === '23505') {
                throw new DataCollisionError("Username or email already in use", 401);
            }
            throw new ExpressError("Server Error", 500);
        };
    };

    static async getRecord(table, matchers) {
        const results = await this.getRecords(table, matchers);
        if (results.length) {
            return results[0];
        };
        throw new RecordNotFoundError(`Record not found in ${table}`, 404);
    };

    static async getRecords(table, matchers) {
        const [str, vars] = this.getReadStringAndVariables(table, matchers);
        const results = await db.query(str, vars);
        return results.rows;
    };


    static async updateRecord(table, data, matchers) {
        const [str, vars] = this.getUpdateStringAndVariables(table, data, matchers);
        const result = await db.query(str, vars);
        if (result.rows.length) {
            return result.rows[0];
        };
        throw new RecordNotFoundError(`Record not found in ${table}`);
    };

    static async deleteRecord(table, matchers) {
        const [str, vars] = this.getDeleteStringAndVariables(table, matchers);
        const result = await db.query(str, vars);
        if (!result.rows.length) {
            throw new RecordNotFoundError(`Record not found in ${table}`);
        };
    };

    static getCreateStringAndVariables(table, data) {
        let str = `INSERT INTO ${table}`;
        const variables = Object.values(data);
        str += ` (${Object.keys(data).join(',')}) VALUES`
        str += ` (${variables.map((k, i) => `$${i+1}`).join(',')}) RETURNING *`;
        return [str, variables];
    };

    static getReadStringAndVariables(table, matchers) {
        let str = table === DB_TABLES.USERS ? `SELECT id, username, email, city, state, created_at, updated_at FROM ${table}` : `SELECT * FROM ${table}`;
        let vars = [];
        if (matchers) {
            str += ` WHERE ${Object.keys(matchers).map((k, i) => `${k}=$${i+1}`).join(' AND ')}`;
            vars = Object.values(matchers);
        }

        return [str, vars];
    };

    static getUpdateStringAndVariables(table, data, matchers) {
        let str = `UPDATE ${table} SET updated_at=CURRENT_TIMESTAMP,`;
        const vars = Object.values(data);
        str += Object.keys(data).map((k, i) => `${k}=$${i+1}`).join(',') + " WHERE ";
        str += Object.keys(matchers).map((k, i) => {
            vars.push(Object.values(matchers)[i]);
            return `${k}=$${vars.length}`;
        }).join(' AND ') + ' RETURNING *';
       return [str, vars];
    };

    static getDeleteStringAndVariables(table, matchers) {
        let str = `DELETE FROM ${table} WHERE `;
        str += Object.keys(matchers).map((k, i) => `${k}=$${i+1}`).join(' AND ') + " RETURNING *";
        return [str, Object.values(matchers)];
    };
};

module.exports = DB;