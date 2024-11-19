const converttoSTR = (err) => {
    let str = "Stack Trace: \n";
    const message = err.message;
    const obj = err.details;
    str += "\tError: " + message + "\n";
    for (const key in obj) {
        str += "\t"+key + ":\n\t\t" + obj[key] + "\n";
    }
    return str;
};

const err = (req, res, statusCode, message) => {
    const error = new Error(message);
    const stack = error.stack;
    const stackLines = stack.split('\n');
    const callerLine = stackLines[2] || stackLines[1];
    const match = callerLine.match(/at (.*?):(\d+):\d+/);
    error.status = statusCode;
    error.details = {
        URL: req.originalUrl,
        Method: req.method,
        IP: req.ip,
        Headers: req.headers,
        Body: req.body,
        Query: req.query,
        Params: req.params,
    }
    if (match) {
        error.details.file = match[1];
        error.details.lineNo = match[2];
    }
    error.stack = converttoSTR(error);
    throw error;
};
const error = (req, res, next) => {
    req.error = err;
    next();
};

exports.setErrUtils = (app) => {
    app.use(error);
    app.error = err;
};

exports.errorHandler = (mode) => {
    return (err, req, res, next) => {
        if (mode === 'development') console.error(err);

        const status = err.status || 500;
        const message = err.message || 'Something went wrong!';

        if (mode === 'development') return res.status(status).json({
            error: {
                message: message,
                details: err.details || {}
            },
        });

        return res.status(status).send(message);
    };
};
