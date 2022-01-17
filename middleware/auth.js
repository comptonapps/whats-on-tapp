const JWT = require('../helpers/JWT');
const { ExpressError } = require('../expressError');

function authenticateJWT(req, res, next) {
    try {
        const { token } = req.body;
        res.locals.user = JWT.validateJWT(token);
        delete req.body.token
        return next();
    } catch(e) {
        return next();
    }
};

function userIsAuthenticated(req, res, next) {
    try {
        if (!res.locals.user) {
            throw new ExpressError('Authentication needed', 403);
        }
        return next();
    } catch(e) {
        return next(e);
    }
}

function checkForCorrectUserOrAdmin(req, res, next) {
    const { user_id } = req.params;
    if (res.locals.user && (res.locals.user.is_admin || res.locals.user.id === user_id)) {
        return next();
    }
    return next(new ExpressError("Unauthorized user", 403));
}

module.exports = {
    authenticateJWT,
    checkForCorrectUserOrAdmin,
    userIsAuthenticated
}