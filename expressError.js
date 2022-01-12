class ExpressError extends Error {
    constructor(message, status) {
        super();
        this.message = message;
        this.status = status;
        console.error = this.stack;
    }
};

class RecordNotFoundError extends ExpressError {
    constructor(message="Record Not Found", status=404) {
        super(message, status);
    }
}

module.exports = {
    ExpressError,
    RecordNotFoundError
}