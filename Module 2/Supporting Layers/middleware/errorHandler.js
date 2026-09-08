const config = require('../config');
const AppError = require('../utils/AppError');

module.exports = function errorHandler(err, req, res, next) {
  const status = err.statusCode || 500;

  const response = {
    error: err.message || 'Internal Server Error'
  };

  if (config.nodeEnv !== 'production' && err.stack) {
    response.stack = err.stack;
  }

  res.status(status).json(response);
};