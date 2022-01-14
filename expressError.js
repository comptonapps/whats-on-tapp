class ExpressError extends Error {
    constructor(message, status) {
        super();
        this.message = message;
        this.status = status;
        console.error = this.stack;
    };
};

class RecordNotFoundError extends ExpressError {
    constructor(message="Record Not Found", status=404) {
        super(message, status);
    };
};

class DataCollisionError extends ExpressError {
    constructor(message="Duplicate Data Error", status=409) {
        super(message, status);
    };
};

class BadRequestError extends ExpressError {
    constructor(message="Bad Request", status=401) {
        super(message, status);
    }
}

module.exports = {
    ExpressError,
    RecordNotFoundError,
    DataCollisionError,
    BadRequestError
};