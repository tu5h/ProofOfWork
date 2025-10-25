// Global error handling middleware
const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Default error
  let error = {
    success: false,
    message: 'Internal server error',
    status: 500
  };

  // Concordium connection errors
  if (err.message.includes('Concordium') || err.message.includes('GRPC')) {
    error = {
      success: false,
      message: 'Blockchain service temporarily unavailable',
      status: 503
    };
  }

  // Database errors
  if (err.message.includes('Supabase') || err.message.includes('database')) {
    error = {
      success: false,
      message: 'Database service temporarily unavailable',
      status: 503
    };
  }

  // Validation errors
  if (err.name === 'ValidationError') {
    error = {
      success: false,
      message: 'Invalid input data',
      status: 400
    };
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    error = {
      success: false,
      message: 'Invalid authentication token',
      status: 401
    };
  }

  // Rate limit errors
  if (err.status === 429) {
    error = {
      success: false,
      message: 'Too many requests, please try again later',
      status: 429
    };
  }

  res.status(error.status).json(error);
};

// Async error wrapper
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

module.exports = {
  errorHandler,
  asyncHandler
};
