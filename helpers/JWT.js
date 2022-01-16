const jwt = require('jsonwebtoken');
const SECRET = process.env.JWT_SECRET
const { BadRequestError } = require('../expressError');


class JWT {
    static getJWT(data) {
        console.log(SECRET);
        const token = jwt.sign(data, SECRET);
        return token;
    }

    static validateJWT(token) {
        try {
            const payload = jwt.verify(token, SECRET);
            return payload;
        } catch(e) {
            throw new BadRequestError("Token not valid", 403)
        }
        
    }
}

module.exports = JWT;