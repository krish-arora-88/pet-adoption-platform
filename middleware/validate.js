const { ZodError } = require('zod');

function validate(schema, source = 'body') {
    return (req, res, next) => {
        try {
            const parsed = schema.parse(req[source]);
            req[source] = parsed;
            next();
        } catch (err) {
            if (err instanceof ZodError) {
                return res.status(400).json({
                    success: false,
                    errors: err.issues.map(e => ({
                        field: e.path.join('.'),
                        message: e.message
                    }))
                });
            }
            next(err);
        }
    };
}

module.exports = { validate };
