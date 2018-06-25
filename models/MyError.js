class Error {
    constructor(error, status=500) {
        const errors = error.array();
        let message = '';
        for (let i=0; i<errors.length; i++) {
            message += errors[i].msg;
            if (i < errors.length - 1) {
                message += ',';
            }
        }

        this.message = message;
        this.status = status;
    }
}

module.exports = Error;