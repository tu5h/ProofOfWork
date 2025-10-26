const Joi = require('joi');

// Validation schemas
const schemas = {
  createJob: Joi.object({
    title: Joi.string().min(3).max(100).required(),
    description: Joi.string().min(10).max(1000).required(),
    amount_plt: Joi.number().positive().max(1000).required(),
    location: Joi.object({
      latitude: Joi.number().min(-90).max(90).required(),
      longitude: Joi.number().min(-180).max(180).required(),
      radius: Joi.number().positive().max(1000).required()
    }).required(),
    business_id: Joi.string().uuid().required()
  }),

  assignJob: Joi.object({
    worker_id: Joi.string().uuid().required(),
    concordium_account: Joi.string().min(40).max(60).required()
  }),

  completeJob: Joi.object({
    position: Joi.object({
      latitude: Joi.number().min(-90).max(90).required(),
      longitude: Joi.number().min(-180).max(180).required()
    }).required(),
    concordium_account: Joi.string().min(40).max(60).required()
  }),

  createProfile: Joi.object({
    role: Joi.string().valid('business', 'worker').required(),
    display_name: Joi.string().min(2).max(50).required(),
    concordium_account: Joi.string().min(40).max(60).optional()
  })
};

// Validation middleware factory
const validate = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        error: error.details[0].message
      });
    }
    
    req.body = value; // Use validated and sanitized data
    next();
  };
};

module.exports = {
  schemas,
  validate
};
