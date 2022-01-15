const jsonschema = require('jsonschema');
const { ExpressError } = require('../expressError');

function schemaValidator(data, schema) {
    const result = jsonschema.validate(data, schema);
    if (!result.valid) {
        const errorList = result.errors.map(e => e.stack);
        throw new ExpressError(errorList, 400);
    }
};

module.exports = schemaValidator;