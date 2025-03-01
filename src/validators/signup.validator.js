const Joi = require('joi');
const errors = require('../../errors/errors')
const {infoLogger} = require('../../logger/logger')


module.exports = function(req, res, next) {
    console.log(req.body)
    const schema = Joi.object({
        requestId: Joi.string().required(),
        role: Joi.string().valid("user", "organizer").required(),
        organizerName: Joi.string().when('role', {
            is: 'organizer',
            then: Joi.string().required(),
            otherwise: Joi.string().optional().allow("").allow(null)
        }),
        firstName: Joi.string().required(),
        lastName: Joi.string().required(),
        email: Joi.string().email().required(),
        password: Joi.string().required()
    });


    const {value, error} = schema.validate(req.body, {abortEarly: true})
    if (error){
        const key = error.details[0].context.key
        infoLogger(req.custom.id, req.body.requestId, `Error in validation: ${key} is invalid`)
        const message = error.details[0].message
        return res.status(400).json({
            statusCode: 1,
            timestamp: Date.now(),
            requestId: req.body.requestId || req.custom.id,
            info: {
                code: errors['004'].code,
                message: message || error.errors['004'].message,
                displayText: errors['004'].displayText
            },
        })
    }

    infoLogger(req.custom.id, req.body.requestId, `All validations passed`)
    return next()
}
