const AppError = require('../utils/AppError');

const validate = (schema, source = 'body') => (req, res, next) => {
    const { error, value } = schema.validate(req[source] ?? {}, {
        abortEarly: false,
        stripUnknown: true,
        convert: true,
    });

    if (error) {
        const details = error.details.map((d) => ({
            field: d.path.join('.'),
            message: d.message,
        }));
        return next(new AppError('Données invalides', 400, details));
    }

    if (source === 'query') {

        Object.defineProperty(req, 'query', {
            value, writable: true, configurable: true, enumerable: true,
        });
    } else if (source === 'params') {
        Object.assign(req.params, value);
    } else {
        req.body = value;
    }
    next();
};

module.exports = validate;