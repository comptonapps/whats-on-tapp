const db = require('../db');

class DB {
    static async create(table, data) {
        const [str, variables] = this.getCreateStringAndVariables(table, data);
        try {
            const results = await db.query(str, variables);
            return results.rows[0];
        } catch(e) {
            // if (e.code && e.code === '23505') {
            //     throw new DataCollisionError("Username or email already in use", 401);
            // }
            // throw new ExpressError("Server Error", 500);
            console.log('error');
        }
    }

    static getCreateStringAndVariables(table, data) {
        let str = `INSERT INTO ${table}`;
        const variables = Object.values(data);
        str += ` (${Object.keys(data).join(',')}) VALUES`
        str += ` (${variables.map((k, i) => `$${i+1}`).join(',')}) RETURNING *`;
        return [str, variables];
    };
};

module.exports = DB;