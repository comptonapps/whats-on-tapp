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

    static update(table, data) {
        
    }

    static getCreateStringAndVariables(table, data) {
        let str = `INSERT INTO ${table}`;
        const variables = Object.values(data);
        str += ` (${Object.keys(data).join(',')}) VALUES`
        str += ` (${variables.map((k, i) => `$${i+1}`).join(',')}) RETURNING *`;
        return [str, variables];
    };

    static getUpdateStringAndVariables(table, data, matchers) {
        let str = `UPDATE ${table} SET `;
        const vars = Object.values(data);
        str += Object.keys(data).map((k, i) => `${k}=$${i+1}`).join(' AND ') + " WHERE ";
        str += Object.keys(matchers).map((k, i) => {
            vars.push(Object.values(matchers)[i]);
            return `${k}=$${vars.length}`;
        }) + ' RETURNING *';
       return [str, vars];
    };

    static getDeleteStringAndVariables(table, matchers) {
        let str = `DELETE FROM ${table} WHERE `;
        str += Object.keys(matchers).map((k, i) => `${k}=$${i+1}`) + " RETURNING *";
        return [str, Object.values(matchers)];
    }
};

module.exports = DB;