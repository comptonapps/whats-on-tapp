const JWT = require('../helpers/JWT');
const { ExpressError } = require('../expressError');

function authenticateJWT(req, res, next) {
    try {
        const { token } = req.body || req.headers.authorizaton.replace(/^[Bb]earer /, "").trim();
        if (token) {
            res.locals.user = JWT.validateJWT(token);
            delete req.body.token
        } else {
            const headerToken = req.headers.authorization;
            res.locals.user = JWT.validateJWT(headerToken.replace(/^[Bb]earer /, "").trim());
        }
        return next();
    } catch(e) {
        return next();
    }
};

function userIsAuthenticated(req, res, next) {
    try {
        if (!res.locals.user) {
            throw new ExpressError('Authentication required', 403);
        }
        return next();
    } catch(e) {
        return next(e);
    }
}

function checkForCorrectUserOrAdmin(req, res, next) {
    const { user_id } = req.params;
    if (res.locals.user && (res.locals.user.is_admin || (+res.locals.user.id === +user_id || +res.locals.user.id === +req.body.user_id))) {
        return next();
    }
    return next(new ExpressError("Unauthorized user", 403));
};

module.exports = {
    authenticateJWT,
    checkForCorrectUserOrAdmin,
    userIsAuthenticated
}