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

function checkForCorrectUserOrAdmin(req, res, next) {
    console.log('PARAMS: ', req.params);
    const { user_id } = req.params;
    console.log(user_id);
    console.log(res.locals.user.id)
    if (res.locals.user && (res.locals.user.is_admin || res.locals.user.id === user_id)) {
        return next();
    }
    return next(new ExpressError("Unauthorized user", 403));
}

module.exports = {
    authenticateJWT,
    checkForCorrectUserOrAdmin
}